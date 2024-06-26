import { useState } from 'react';
import axios from 'axios';

const UserData = ({ users, token, path, refreshData }) => {
  const [modalImage, setModalImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remark, setRemark] = useState('');
  const [actionType, setActionType] = useState();
  const [modalSuccess, setModalSuccess] = useState(false);

  const openModal = (user, actionType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setActionType(actionType);
    setModalSuccess(false);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
    setRemark('');
    setModalSuccess(false);
  };

  const handleModalSuccess = () => {
    setModalSuccess(true);
    setTimeout(() => {
      closeModal(); // Close modal after a delay (you can adjust the delay time)
      refreshData(); // Refresh user data
    }, 2000); // Delay in milliseconds (1 second in this example)
  };

  const openImageModal = (image_name) => {
    setModalImage(image_name);
  };

  const closeImageModal = () => {
    setModalImage(null);
  };

  const acceptRequests = async (id, user_id, utrNumber, amount, token) => {
    try {
      // let token = await login();
      let data = JSON.stringify({
        uid: user_id,
        balance: amount,
        withdraw_req_id: id,
        remark: 'satie',
      });
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          authority: 'adminapi.bestlive.io',
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-IN,en;q=0.9,mr;q=0.8,lb;q=0.7',
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache, no-store',
          'content-type': 'application/json',
          encryption: 'false',
        },
        data: data,
      };
      const response = await axios.post(
        'https://adminapi.bestlive.io/api/app-user/action/deposit-balance',
        data,
        config
      );
      if (response.status !== 200) {
        throw new Error('Request failed with status: ' + response.status);
      } else if (response.data.status === 1) {
        // console.log(response.data);
        handleModalSuccess();
      } else {
        throw new Error('Invalid response data format');
      }
    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  };

  const rejectRequests = async (id, token, remark) => {
    try {
      let data = JSON.stringify({
        id: id,
        notification_status: 2,
        is_accepted: 2,
        remark: remark,
      });
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          authority: 'adminapi.bestlive.io',
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-IN,en;q=0.9,mr;q=0.8,lb;q=0.7',
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache, no-store',
          'content-type': 'application/json',
          encryption: 'false',
        },
        data: data,
      };
      const response = await axios.post(
        'https://adminapi.bestlive.io/api/bank-account/notification',
        data,
        config
      );
      if (response.status !== 200) {
        throw new Error('Request failed with status: ' + response.status);
      } else if (response.data.status === 1) {
        // console.log(response.data);
        handleModalSuccess();
      } else {
        throw new Error('Invalid response data format');
      }
    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  };

  return (
    <>
      {users.map((user) => {
        const {
          id,
          username,
          user_id,
          account_number,
          ifsc_code,
          utr_number,
          amount,
          balance,
          pl_balance,
          image_name,
          created_on,
        } = user;

        return (
          <tr key={id}>
            <td>{username}</td>
            <td>{account_number}</td>
            <td>{ifsc_code}</td>
            <td>{utr_number}</td>
            <td>
              {image_name.startsWith('UTR') ? (
                <a href="#" onClick={() => openImageModal(path + image_name)}>
                  View
                </a>
              ) : (
                // "No Image"
                ''
              )}
            </td>
            <td>{amount}</td>
            <td>{created_on}</td>
            <td className="td-button">
              <button
                className="action-button accept"
                onClick={() => openModal(user, 'accept')}
              >
                Accept
              </button>
              &nbsp;
              <button
                className="action-button reject"
                onClick={() => openModal(user, 'reject')}
              >
                Reject
              </button>
            </td>
          </tr>
        );
      })}
      {/* Modal */}
      {modalImage && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="close" onClick={() => closeImageModal()}>
              &times;
            </span>
            <img className="modal-img" src={modalImage} alt="Modal" />
          </div>
        </div>
      )}
      {/* Modal */}
      {selectedUser && isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            {modalSuccess && (
              <div className="modal-success">
                Request successfully processed
              </div>
            )}
            {actionType === 'accept' && (
              <>
                <label>Please confirm request</label>
              </>
            )}

            {actionType === 'accept' && (
              <button
                className="accept"
                onClick={() =>
                  acceptRequests(
                    selectedUser.id,
                    selectedUser.user_id,
                    selectedUser.utr_number,
                    selectedUser.amount,
                    token
                  )
                }
              >
                Accept
              </button>
            )}
            {actionType === 'reject' && (
              <>
                <label>Remark:</label>
                <textarea
                  value={remark}
                  required
                  onChange={(e) => setRemark(e.target.value)}
                />
                <button
                  className="accept"
                  onClick={() => rejectRequests(selectedUser.id, token, remark)}
                >
                  Reject
                </button>
              </>
            )}
            <button className="reject" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default UserData;
