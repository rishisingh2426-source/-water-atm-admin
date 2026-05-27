"use client";

import { db } from "../firebase";
import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

export default function Home() {

  const ADMIN_ID = "admin";
  const ADMIN_PASSWORD = "1234";

  const [loggedIn, setLoggedIn] = useState(false);

  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [rechargeDate, setRechargeDate] = useState("");

  const [expense, setExpense] = useState("");

  const [search, setSearch] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [recharges, setRecharges] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {

    const savedLogin = localStorage.getItem("loggedIn");

    if (savedLogin === "true") {
      setLoggedIn(true);
    }

    const unsubscribeRecharges = onSnapshot(
      collection(db, "recharges"),
      (snapshot) => {

        const rechargeData: any[] = [];

        snapshot.forEach((doc) => {
          rechargeData.push(doc.data());
        });

        setRecharges(rechargeData);

      }
    );

    const unsubscribeExpenses = onSnapshot(
      collection(db, "expenses"),
      (snapshot) => {

        const expenseData: any[] = [];

        snapshot.forEach((doc) => {
          expenseData.push(doc.data());
        });

        setExpenses(expenseData);

      }
    );

    return () => {
      unsubscribeRecharges();
      unsubscribeExpenses();
    };

  }, []);

  const handleLogin = () => {

    if (
      loginId === ADMIN_ID &&
      loginPassword === ADMIN_PASSWORD
    ) {

      setLoggedIn(true);

      localStorage.setItem(
        "loggedIn",
        "true"
      );

    } else {

      alert("Invalid ID or Password");

    }
  };

  const handleLogout = () => {

    setLoggedIn(false);

    localStorage.removeItem("loggedIn");
  };

  const handleRecharge = async () => {

    if (!name || !phone || !address || !amount || !rechargeDate) {
      alert("Please fill all fields");
      return;
    }

    const existingCustomer = recharges.find(
      (item) => item.phone === phone
    );

    const previousBalance =
      existingCustomer
        ? Number(existingCustomer.balance || 0)
        : 0;

    const newRecharge = {
      name,
      phone,
      address,
      amount,
      balance:
        previousBalance + Number(amount),
      rechargeDate,
      createdAt: new Date().toLocaleString(),
    };

    await addDoc(
      collection(db, "recharges"),
      newRecharge
    );

    setSuccessMessage(
      `Recharge Successful for ${name}`
    );

    const message =
      `Hello ${name}, Your Water ATM recharge of ₹${amount} is successful. Current Balance: ₹${newRecharge.balance}`;

    window.open(
      `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
    );

    setName("");
    setPhone("");
    setAddress("");
    setAmount("");
    setRechargeDate("");

  };

  const handleExpense = async () => {

    if (!expense) {
      alert("Enter expense amount");
      return;
    }

    const newExpense = {
      amount: Number(expense),
      date: new Date().toLocaleString(),
    };

    await addDoc(
      collection(db, "expenses"),
      newExpense
    );

    setExpense("");
  };

  const filteredRecharges =
    recharges.filter(
      (item) =>
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.phone?.includes(search)
    );

  const totalRecharge =
    recharges.reduce(
      (total, item) =>
        total + Number(item.amount),
      0
    );

  const totalExpense =
    expenses.reduce(
      (total, item) =>
        total + Number(item.amount),
      0
    );

  if (!loggedIn) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-100">

        <div className="bg-white p-8 rounded-3xl shadow-xl w-[350px]">

          <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
            Water ATM Login
          </h1>

          <input
            type="text"
            placeholder="Admin ID"
            value={loginId}
            onChange={(e) =>
              setLoginId(e.target.value)
            }
            className="border border-slate-300 rounded-xl px-4 py-3 text-black w-full mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) =>
              setLoginPassword(e.target.value)
            }
            className="border border-slate-300 rounded-xl px-4 py-3 text-black w-full mb-5"
          />

          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white w-full py-3 rounded-2xl"
          >
            Login
          </button>

        </div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-4xl font-bold text-blue-700">
              Water ATM Admin Panel
            </h1>

            <p className="text-slate-600 mt-2">
              Recharge customers and manage expenses
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-3 rounded-2xl"
          >
            Logout
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-2xl p-5 shadow">

            <p className="text-slate-500">
              Total Customers
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {recharges.length}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 shadow">

            <p className="text-slate-500">
              Total Recharge
            </p>

            <h2 className="text-3xl font-bold mt-2">
              ₹{totalRecharge}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 shadow">

            <p className="text-slate-500">
              Total Expense
            </p>

            <h2 className="text-3xl font-bold mt-2">
              ₹{totalExpense}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 shadow">

            <p className="text-slate-500">
              Profit
            </p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              ₹{totalRecharge - totalExpense}
            </h2>

          </div>

        </div>

        {successMessage && (

          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-2xl mb-6">

            {successMessage}

          </div>

        )}

        <div className="bg-white rounded-2xl p-6 shadow mb-8">

          <h2 className="text-2xl font-semibold mb-5">
            Recharge Customer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Customer Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="border border-slate-300 rounded-xl px-4 py-3 text-black"
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="border border-slate-300 rounded-xl px-4 py-3 text-black"
            />

            <input
              type="text"
              placeholder="Customer Address"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              className="border border-slate-300 rounded-xl px-4 py-3 text-black"
            />

            <input
              type="number"
              placeholder="Recharge Amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="border border-slate-300 rounded-xl px-4 py-3 text-black"
            />

            <input
              type="date"
              value={rechargeDate}
              onChange={(e) =>
                setRechargeDate(e.target.value)
              }
              className="border border-slate-300 rounded-xl px-4 py-3 text-black"
            />

          </div>

          <button
            onClick={handleRecharge}
            className="mt-5 bg-green-600 text-white px-6 py-3 rounded-2xl"
          >
            Recharge & Send WhatsApp
          </button>

        </div>

        <div className="bg-white rounded-2xl p-6 shadow mb-8">

          <h2 className="text-2xl font-semibold mb-5">
            Add Expense
          </h2>

          <div className="flex gap-4">

            <input
              type="number"
              placeholder="Expense Amount"
              value={expense}
              onChange={(e) =>
                setExpense(e.target.value)
              }
              className="border border-slate-300 rounded-xl px-4 py-3 text-black w-full"
            />

            <button
              onClick={handleExpense}
              className="bg-red-600 text-white px-6 py-3 rounded-2xl"
            >
              Add Expense
            </button>

          </div>

        </div>

        <div className="bg-white rounded-2xl p-6 shadow">

          <h2 className="text-2xl font-semibold mb-5">
            Recharge History
          </h2>

          <input
            type="text"
            placeholder="Search customer by name or phone"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border border-slate-300 rounded-xl px-4 py-3 text-black w-full mb-5"
          />

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b">

                  <th className="py-3">Name</th>

                  <th>Phone</th>

                  <th>Address</th>

                  <th>Amount</th>

                  <th>Balance</th>

                  <th>Recharge Date</th>

                  <th>Created At</th>

                </tr>

              </thead>

              <tbody>

                {filteredRecharges.map(
                  (item, index) => (

                    <tr
                      key={index}
                      className="border-b"
                    >

                      <td className="py-3">
                        {item.name}
                      </td>

                      <td>{item.phone}</td>

                      <td>{item.address}</td>

                      <td>
                        ₹{item.amount}
                      </td>

                      <td>
                        ₹{item.balance}
                      </td>

                      <td>
                        {item.rechargeDate}
                      </td>

                      <td>
                        {item.createdAt}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}