import { useState, useCallback, useEffect } from "react";
import CurrencyInput from "react-currency-input-field";
import api from "../services/api";

function LoanRegister() {
  const numberWithDot = useCallback((text) =>
    text.replace(/[^0-9,]/g, "").replace(",", ".")
  );

  const dateToString = useCallback((date) => {
    const [dateString] = date.toISOString().split("T");
    return dateString;
  });

  const [client, setClient] = useState("");
  const [clientId, setClientId] = useState(null);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("30");
  const [days, setDays] = useState(30);
  const [clientList, setClientList] = useState([]);
  const [btnDisabled, setBtnDisabled] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    return dateToString(currentDate);
  });

  const [paymentDate, setPaymentDate] = useState(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    return dateToString(futureDate);
  });

  const handleClient = useCallback(({ target }) => {
    setClient(target.value);
    const clientInfo = clientList.find(({ name }) => name === target.value);
    if (clientInfo) {
      setClientId(clientInfo.id);
    } else {
      setClientId(null);
    }
  });

  const handleAmount = useCallback((value = "") => setAmount(value));
  const handleRate = useCallback((value = "") => setRate(value));

  const handleStartDate = useCallback(({ target }) =>
    setStartDate(target.value)
  );

  const handlePaymentDate = useCallback(({ target }) =>
    setPaymentDate(target.value)
  );

  const handleDays = useCallback((value) => {
    const currentDate = new Date(startDate);

    if (!value) {
      setPaymentDate(dateToString(currentDate));
    } else {
      currentDate.setDate(currentDate.getDate() + parseInt(value, 10));
      setPaymentDate(dateToString(currentDate));
    }

    setDays(value);
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get("client/list");
        setClientList(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (amount === "0") {
      return global.alert("Valor do empréstimo não pode ser zero");
    }

    try {
      const loanInfo = {
        clientId,
        amount: parseFloat(numberWithDot(amount)),
        startDate,
        paymentDate,
        rate: parseFloat(numberWithDot(rate)),
      };

      setBtnDisabled(true);
      await api.post("loan/create", loanInfo);
      global.alert("Empréstimo cadastrado com sucesso!");
      return window.location.reload();
    } catch (error) {
      setBtnDisabled(false);
      return global.alert("Erro no sistema");
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="client">Cliente</label>
      <input
        type="text"
        name="client"
        required
        autoComplete="off"
        list="clientName"
        onChange={handleClient}
        value={client}
      />
      <datalist id="clientName">
        {clientList.map(({ id, name }) => (
          <option key={id} value={name}>
            {name}
          </option>
        ))}
      </datalist>
      <label htmlFor="amount">Valor</label>
      <CurrencyInput
        id="amount"
        name="amount"
        required
        autoComplete="off"
        placeholder="0,00"
        value={amount}
        decimalScale={2}
        allowNegativeValue={false}
        onValueChange={handleAmount}
      />
      <label htmlFor="rate">Percentual</label>
      <CurrencyInput
        id="rate"
        name="rate"
        required
        autoComplete="off"
        value={rate}
        decimalsLimit={20}
        allowNegativeValue={false}
        onValueChange={handleRate}
      />
      <label htmlFor="days">Dias</label>
      <CurrencyInput
        id="days"
        name="days"
        autoComplete="off"
        value={days}
        allowDecimals={false}
        allowNegativeValue={false}
        onValueChange={handleDays}
      />
      <label htmlFor="start-date">Data inicial</label>
      <input
        type="date"
        id="start-date"
        name="start-date"
        required
        value={startDate}
        onChange={handleStartDate}
      />
      <label htmlFor="payment-date">Data de pagamento</label>
      <input
        type="date"
        id="payment-date"
        name="payment-date"
        required
        value={paymentDate}
        onChange={handlePaymentDate}
      />
      <button type="submit" disabled={btnDisabled}>
        Finalizar
      </button>
    </form>
  );
}

export default LoanRegister;
