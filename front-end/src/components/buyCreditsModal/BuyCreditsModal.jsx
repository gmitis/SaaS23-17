import { useContext, useState } from 'react';
import { Button, Card, Container, Modal } from 'react-bootstrap';

import './buyCreditsModal.css';
import { SubmitWaitButton } from '..';
import { BackendService } from '../../services';
import { UserContext } from '../../UserContext';

const BuyCreditsModal = ({ show, onHide }) => {
  const [selectedCredits, setSelectedCredits] = useState(0);
  const { userInfo, setUserInfo } = useContext(UserContext);

  const handleHide = () => {
    setSelectedCredits(0);
    onHide();
  }

  const handlePurchaseButton = () => {

    return new Promise(async (resolve, reject) => {
      try {
        const result = await BackendService.creditsBuy(userInfo.email, selectedCredits);
        // update Context on success
        setUserInfo({ 
          ...userInfo,
          credits: result.newCredits
        })
        setSelectedCredits(0); // resetValue
        resolve(() => undefined);
      } catch (e) {
        reject(e)
      }
    })

  }

  const handleSelectedCreditsButton = (value) => {
    setSelectedCredits(value);
  }

  const pricingList = [
    { 'quantity': 5, 'value': 5 },
    { 'quantity': 10, 'value': 10 },
    { 'quantity': 20, 'value': 20 },
    { 'quantity': 50, 'value': 50 },
  ];

  return (
    <Modal show={show} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title id='modal-title'>Buy Credits</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="row">
          {pricingList.map((item, idx) => (
            <Container key={idx} className="col-md-6">
              <Card
                className={`m-2 credit-card ${selectedCredits === item.quantity ? 'selected' : ''}`}
                onClick={() => handleSelectedCreditsButton(item.quantity)}
              >
                <Card.Body>
                  <Card.Title id='credit-card-title'>{item.quantity} Credits</Card.Title>
                  <Card.Text id='credit-card-text'>{Number(item.value).toFixed(2)} €</Card.Text>
                </Card.Body>
              </Card>
            </Container>
          ))}
        </Container>
      </Modal.Body>
      <Modal.Footer >
        <Container className='d-flex flex-row mt-2'>

          <Button id="cancel-button" onClick={handleHide}>
            Cancel
          </Button>
          <SubmitWaitButton
            action={handlePurchaseButton}
            actionName='Purchase'
            disabledIf={selectedCredits === 0}
            cssId="purchase-button"
          />
        </Container>
      </Modal.Footer>

    </Modal>
  );
}

export default BuyCreditsModal