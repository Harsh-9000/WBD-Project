import { Button } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import React, { useEffect } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Loader from '../Layout/Loader';
import axios from 'axios';
import { server } from '../../server';
import { useState } from 'react';

const AllProducts = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${server}/product/admin-all-products`, { withCredentials: true })
      .then((res) => {
        setData(res.data.products);
        setIsLoading(false);
      });
  }, []);

  const columns = [
    { field: 'id', headerName: 'Product Id', minWidth: 250, flex: 0.8 },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 200,
      flex: 1.4
    },
    {
      field: 'price',
      headerName: 'Price',
      minWidth: 100,
      flex: 0.6
    },
    {
      field: 'Stock',
      headerName: 'Stock',
      type: 'number',
      minWidth: 80,
      flex: 0.5
    },

    {
      field: 'sold',
      headerName: 'Sold out',
      type: 'number',
      minWidth: 100,
      flex: 0.6
    },
    {
      field: 'Preview',
      flex: 0.6,
      minWidth: 100,
      headerName: '',
      type: 'number',
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/product/${params.id}`}>
              <Button>
                <AiOutlineEye size={20} />
              </Button>
            </Link>
          </>
        );
      }
    }
  ];

  const row = [];

  data &&
    data.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: 'US$ ' + item.discountPrice,
        Stock: item.stock,
        sold: item?.sold_out
      });
    });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </>
  );
};

export default AllProducts;
