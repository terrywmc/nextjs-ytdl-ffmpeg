import type { NextPage } from "next";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import { useState } from "react";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";

const Home: NextPage = () => {
  const [videoSrc, setVideoSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const [yUrl, setYUrl] = useState(
    "http://www.youtube.com/watch?v=aqz-KE-bpKQ"
  );
  const [message, setMessage] = useState("Click Start to transcode");
  const ffmpeg = createFFmpeg({
    log: true,
    corePath: "http://localhost:3000/ffmpeg-core/dist/ffmpeg-core.js",
    // corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
  });

  const handleSubmit = async () => {
    await ffmpeg.load();
    if (loading) setLoading(false);
    if (videoSrc != "") await setVideoSrc("");
    setError(false);
    setLoading(true);

    setMessage("Downloading...");
    const response = await fetch("/api/download", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: yUrl,
      }),
    });
    //handle download error
    if (!response.ok) {
      setMessage("Error occur while downloading...");
      setError(true);
      setLoading(false);
      return;
    }
    const file = await response.arrayBuffer();

    setMessage("Transcoding...");
    await ffmpeg.FS("writeFile", "tmp.mp4", new Uint8Array(file));
    await ffmpeg.run("-i", "tmp.mp4", "-b:a", "192K", "-vn", "tmp.mp3");
    setMessage("Complete transcoding");
    setSuccess(true);
    setLoading(false);
    const data = await ffmpeg.FS("readFile", "tmp.mp3");
    setVideoSrc(
      URL.createObjectURL(new Blob([data.buffer], { type: "audio/mpeg" }))
    );
  };

  return (
    <>
      {/* Show Hero */}
      <Container maxWidth="md" component="main">
        <Typography component="h1" variant="h2" align="center" gutterBottom>
          Youtube and ffmepg convert
        </Typography>
      </Container>

      {/* Show text box */}
      <Container maxWidth="md" component="main">
        <TextField
          type="text"
          size="medium"
          fullWidth
          value={yUrl}
          onChange={(e: any) => setYUrl(e.target.value)}
        />

        {/* Show submit button */}
        <Button fullWidth variant="contained" onClick={handleSubmit}>
          Start
        </Button>
      </Container>

      {/* Show message */}
      <Container maxWidth="md" component="main">
        <Box
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <Alert
            severity={error ? "error" : success ? "success" : "info"}
            style={{ width: "100%" }}
          >
            {message}
          </Alert>
        </Box>
      </Container>

      {/* Show loading */}
      {loading && (
        <Container maxWidth="md" component="main">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </div>
        </Container>
      )}

      {/* Show Audio */}
      {videoSrc && (
        <Container maxWidth="md" component="main">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <audio controls src={videoSrc}>
              Your browser does not support the audio element.
            </audio>
          </div>
        </Container>
      )}
    </>
  );
};

export default Home;
