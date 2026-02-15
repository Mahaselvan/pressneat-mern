import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber
} from "@chakra-ui/react";
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
        <StatBox label="Total Orders" value={data.totalOrders} />
        <StatBox label="Total Revenue" value={`₹${data.totalRevenue}`} />
        <StatBox label="Today's Orders" value={data.todaysOrders} />
        <StatBox label="Active Orders" value={data.activeOrders} />
        <StatBox label="Premium Users" value={data.premiumUsers} />
      </SimpleGrid>
    </Box>
  );
};

const StatBox = ({ label, value }) => (
  <Stat
    p={5}
    shadow="md"
    borderRadius="lg"
    bg="white"
  >
    <StatLabel>{label}</StatLabel>
    <StatNumber>{value}</StatNumber>
  </Stat>
);

export default AdminDashboard;
