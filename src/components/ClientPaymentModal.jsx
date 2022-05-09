import { useState, useCallback } from "react";
import Modal from "react-modal";
import CurrencyInput from "react-currency-input-field";
import api from "../services/api";

Modal.setAppElement("#root");

function ClientPaymentModal({
  id,
  monthlyInterest,
  debt,
  modalIsOpen,
  handleModal,
}) {
  const numberWithDot = useCallback((text) =>
    text.replace(/[^0-9,]/g, "").replace(",", ".")
  );

  const [payment, setPayment] = useState("");

  const monthlyPayment = useCallback(() =>
    setPayment(
      monthlyInterest.toLocaleString("pt-br", {
        minimumFractionDigits: 2,
      })
    )
  );

  const payOffDebt = useCallback(() =>
    setPayment(
      debt
        .toLocaleString("pt-br", {
          minimumFractionDigits: 2,
        })
        .replace(".", "")
    )
  );

  const handlePayment = useCallback((value = "") => {
    const numberValue = parseFloat(numberWithDot(value));

    if (numberValue > debt) {
      payOffDebt();
    } else {
      setPayment(value);
    }
  });

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (payment === "0") {
      return global.alert("Valor do pagamento não pode ser zero");
    }

    try {
      const today = new Date();
      const [date] = today.toISOString().split("T");

      const paymentInfo = {
        loanId: id,
        date,
        amount: parseFloat(numberWithDot(payment)),
      };

      await api.post("ledger/create", paymentInfo);
      global.alert("Pagamento efetuado com sucesso!");
      return window.location.reload();
    } catch (error) {
      return global.alert("Erro no sistema");
    }
  });

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleModal}
      contentLabel="Example Modal"
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor="payment">Valor</label>
        <CurrencyInput
          id="payment"
          name="payment"
          autoComplete="off"
          placeholder="0,00"
          required
          value={payment}
          decimalScale={2}
          allowNegativeValue={false}
          onValueChange={handlePayment}
        />
        <button type="button" onClick={monthlyPayment}>
          Juros mensal
        </button>
        <button type="button" onClick={payOffDebt}>
          Quitar dívida
        </button>
        <button type="submit">Confirmar</button>
        <p>{payment}</p>
      </form>
    </Modal>
  );
}

export default ClientPaymentModal;
