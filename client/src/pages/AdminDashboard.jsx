import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/admin/analytics").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <Box p={6}>
      <Heading mb={6}>Admin Analytics</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        <MetricCard label="Total Orders" value={data.totalOrders} />
        <MetricCard label="Total Revenue" value={`₹${data.totalRevenue}`} />
        <MetricCard label="Today's Orders" value={data.todaysOrders} />
        <MetricCard label="Active Orders" value={data.activeOrders} />
        <MetricCard label="Premium Users" value={data.premiumUsers} />
      </SimpleGrid>
    </Box>
  );
};

const MetricCard = ({ label, value }) => (
  <Box p={5} shadow="md" borderRadius="lg" bg="white">
    <Text color="gray.500" fontSize="sm">
      {label}
    </Text>
    <Text fontSize="2xl" fontWeight="bold">
      {value}
    </Text>
  </Box>
);

export default AdminDashboard;
