import ClipboardJS from 'clipboard';
import { useEffect, useState } from 'react';
import { Button, Container, Modal } from 'react-bootstrap';

const DownloadHTMLModal = ({ show, setShow, htmlContent }) => {
  // Initialize ClipboardJS on component mount
  useEffect(() => {
    const clipboard = new ClipboardJS('#copyToClipboard');
    return () => {
      // Cleanup ClipboardJS on component unmount
      clipboard.destroy();
    };
  }, []);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true)
  };

  return (
    <>
      <Modal show={show} onHide={() => {setShow(false); setCopied(false)}}>
        <Modal.Header closeButton>
          <Modal.Title>HTML Modal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container id="htmlContent">
            {`${htmlContent.substring(0, 200)}`}<br />{` more...`}
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <h4 style={{ display: copied ? '' : 'none' }}>Complete!</h4>
          <Button id="copyToClipboard" onClick={handleCopy} variant='success'>
            Copy to Clipboard
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DownloadHTMLModal
