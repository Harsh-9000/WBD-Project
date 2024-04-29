import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { server } from '../../server';
import { Link } from 'react-router-dom';
import { DataGrid } from '@material-ui/data-grid';
import { BsPencil } from 'react-icons/bs';
import { RxCross1 } from 'react-icons/rx';
import styles from '../../styles/styles';
import { toast } from 'react-toastify';
import { CgSpinner } from 'react-icons/cg';

const AllWithdraw = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState();
  const [withdrawStatus, setWithdrawStatus] = useState('Processing');
  const [isUpdatingWithdraw, setIsUpdatingWithdraw] = useState(false);

  useEffect(() => {
    axios
      .get(`${server}/withdraw/get-all-withdraw-request`, {
        withCredentials: true
      })
      .then((res) => {
        setData(res.data.withdraws);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }, []);

  const columns = [
    { field: 'id', headerName: 'Withdraw Id', minWidth: 250, flex: 0.8 },
    {
      field: 'name',
      headerName: 'Shop Name',
      minWidth: 200,
      flex: 1.4
    },
    {
      field: 'shopId',
      headerName: 'Shop Id',
      minWidth: 200,
      flex: 1.4
    },
    {
      field: 'amount',
      headerName: 'Amount',
      minWidth: 120,
      flex: 0.8
    },
    {
      field: 'status',
      headerName: 'status',
      type: 'text',
      minWidth: 120,
      flex: 0.7
    },
    {
      field: 'createdAt',
      headerName: 'Requested at',
      type: 'number',
      minWidth: 170,
      flex: 0.7
    },
    {
      field: ' ',
      headerName: 'Update Status',
      type: 'number',
      minWidth: 180,
      flex: 0.7,
      renderCell: (params) => {
        return (
          <BsPencil
            size={20}
            className={`${
              params.row.status !== 'Processing' ? 'hidden' : ''
            } mr-5 cursor-pointer`}
            onClick={() => setOpen(true) || setWithdrawData(params.row)}
          />
        );
      }
    }
  ];

  const handleSubmit = async () => {
    setIsUpdatingWithdraw(true);
    await axios
      .put(
        `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
        {
          sellerId: withdrawData.shopId
        },
        { withCredentials: true }
      )
      .then((res) => {
        setIsUpdatingWithdraw(false);
        toast.success('Withdraw request updated successfully!');
        window.location.reload(true);
        setOpen(false);
      })
      .catch((err) => {
        setIsUpdatingWithdraw(false);
        toast.error(err.response.data.message);
      });
  };

  const row = [];

  data &&
    data.forEach((item) => {
      row.push({
        id: item._id,
        shopId: item.seller._id,
        name: item.seller.name,
        amount: 'US$ ' + item.amount,
        status: item.status,
        createdAt: item.createdAt.slice(0, 10)
      });
    });
  return (
    <div className="w-full flex items-center pt-5 justify-center">
      <div className="w-[95%] bg-white">
        <DataGrid
          rows={row}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
        />
      </div>
      {open && (
        <div className="w-full fixed h-screen top-0 left-0 bg-[#00000031] z-[9999] flex items-center justify-center">
          <div className="w-[50%] min-h-[40vh] bg-white rounded shadow p-4">
            <div className="flex justify-end w-full">
              <RxCross1 size={25} onClick={() => setOpen(false)} />
            </div>
            <h1 className="text-[25px] text-center font-Poppins">
              Update Withdraw status
            </h1>
            <br />
            <select
              name=""
              id=""
              onChange={(e) => setWithdrawStatus(e.target.value)}
              className="w-[200px] h-[35px] border rounded"
            >
              <option value={withdrawStatus}>{withdrawData.status}</option>
              <option value={withdrawStatus}>Succeed</option>
            </select>
            <button
              disabled={isUpdatingWithdraw}
              type="submit"
              className={`block ${styles.button} text-white !h-[42px] mt-4 text-[18px] disabled:cursor-not-allowed`}
              onClick={handleSubmit}
            >
              {isUpdatingWithdraw ? (
                <CgSpinner size={20} className=" inline animate-spin" />
              ) : (
                <span>Update</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdraw;
