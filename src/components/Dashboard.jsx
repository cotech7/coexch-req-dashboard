import { useEffect, useState } from "react";
import axios from "axios";
import UserData from "./UserData.jsx";
import "../App.css";

const Dashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  // const [token, setToken] = useState(null);
  const [path, setPath] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const whatsappUrl = import.meta.env.VITE_REACT_APP_WHATSAPP_URL;
  const token = import.meta.env.VITE_REACT_APP_TOKEN;

  // const login = async () => {
  //   try {
  //     let data = JSON.stringify({
  //       username: import.meta.env.VITE_REACT_APP_USERNAME,
  //       password: import.meta.env.VITE_REACT_APP_PASSWORD,
  //       systemId: import.meta.env.VITE_REACT_APP_SYSTEM_ID,
  //     });
  //     let config = {
  //       method: "post",
  //       maxBodyLength: Infinity,
  //       headers: {
  //         authority: "adminapi.bestlive.io",
  //         accept: "application/json, text/plain, */*",
  //         "accept-language": "en-IN,en;q=0.9,mr;q=0.8,lb;q=0.7",
  //         "cache-control": "no-cache, no-store",
  //         "content-type": "application/json",
  //         encryption: "false",
  //       },
  //       data: data,
  //     };
  //     const response = await axios.post(
  //       "https://adminapi.bestlive.io/api/login",
  //       data,
  //       config
  //     );
  //     if (response.status !== 200) {
  //       response_value = {
  //         success: false,
  //         message: response.status,
  //       };
  //     } else {
  //       // console.log(response.data);
  //       const newToken = response.data.data.token;
  //       // setToken(newToken);
  //       sessionStorage.setItem("token", newToken);

  //       return newToken;
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  const sendWhatsAppMessage = async (message) => {
    try {
      let data = JSON.stringify({
        message: message,
      });
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${whatsappUrl}/api/requests/sendnotification`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      const response = await axios.request(config);

      console.log("WhatsApp message sent:", response.data);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      // console.log(token);
      let data = JSON.stringify({
        type: "",
        nType: "deposit",
        start_date: "",
        end_date: "",
        isFirst: 1,
      });
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        headers: {
          authority: "adminapi.bestlive.io",
          accept: "application/json, text/plain, */*",
          "accept-language": "en-IN,en;q=0.9,mr;q=0.8,lb;q=0.7",
          authorization: `Bearer ${token}`,
          "cache-control": "no-cache, no-store",
          "content-type": "application/json",
          encryption: "false",
        },
        data: data,
      };
      const response = await axios.post(
        "https://adminapi.bestlive.io/api/bank-account/request",
        data,
        config
      );
      setUsers(response.data.data);
      setPath(response.data.path);
      // console.log(response.data.data);
      let count = response.data.data.length;
      if (count >= 10) {
        await sendWhatsAppMessage(
          `Deposits requests are pending in cccc : ${count}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshData = async () => {
    try {
      if (token) {
        setIsRefreshing(true); // Add this line to set the refreshing flag

        await fetchUsers();

        setIsRefreshing(false); // Clear the refreshing flag when done
      }
    } catch (e) {
      console.error(e);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       let tokenFromStorage = sessionStorage.getItem("token");
  //       if (!tokenFromStorage) {
  //         const newToken = await login();
  //         if (newToken) {
  //           // console.log(`this is newToken ${newToken}`);
  //           setToken(newToken); // Set the token state here as well
  //           await fetchUsers(newToken);
  //         }
  //       } else {
  //         setToken(tokenFromStorage); // Set the token state if already present
  //         await fetchUsers(tokenFromStorage);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div>
        <h1>CCCC Deposits</h1>
        <button
          className={`action-button ${isRefreshing ? "refreshing-button" : ""}`}
          onClick={refreshData}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Account No.</th>
              <th>IFSC Code</th>
              <th>UTR No.</th>
              <th>Screenshot</th>
              <th>Amount</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <UserData
              users={users}
              token={token}
              path={path}
              refreshData={refreshData}
            />
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Dashboard;
