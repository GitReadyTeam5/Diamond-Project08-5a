import React, { useState, useEffect } from 'react';
import { Table, Spin } from 'antd';
import { Link } from 'react-router-dom';

export default function GradesTab({ searchParams, setSearchParams }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(
    searchParams.has('page') ? parseInt(searchParams.get('page')) : 1
  );

  const assignmentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '100%',
      render: (text, record) => (
        <Link to={`/assignments/${record.id}`}>{text}</Link>
      ),
    },
  ];

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('http://localhost:1337/activities?_limit=40'); // Replace with your actual API endpoint
        const data = await response.json();
        console.log("TEstststssttstst")
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []); // Empty dependency array means this effect runs once when the component mounts

  if (loading) {
    return <Spin />; // Display a loading spinner while data is being fetched
  }

  return (
    <div>
      <div id='page-header'>
        <h1>Assignments</h1>
      </div>
      <div
        id='assignments-table-container'
        style={{ marginTop: '6.6vh', maxWidth: '800px', margin: 'auto' }}
      >
        <Table
          columns={assignmentColumns}
          dataSource={assignments}
          rowKey='id'
          pagination={{
            current: page,
            onChange: (newPage) => {
              setPage(newPage);
              setSearchParams({ page: newPage });
            },
          }}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
