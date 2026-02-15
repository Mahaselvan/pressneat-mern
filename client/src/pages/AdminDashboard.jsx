import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("Loading analytics...");

  useEffect(() => {
    axios
      .get("/admin/analytics")
      .then((res) => {
        setData(res.data);
        setMessage("");
      })
      .catch(() => setMessage("Unable to load analytics."));
  }, []);

  return (
    <>
      <Navbar />
      <Box px={5} py={8} maxW="1050px" mx="auto">
        <Heading mb={6} color="orange.500">
          Admin Analytics
        </Heading>
        {!data ? (
          <Text>{message}</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            <MetricCard label="Total Orders" value={data.totalOrders} />
            <MetricCard label="Total Revenue" value={`₹${data.totalRevenue}`} />
            <MetricCard label="Today's Orders" value={data.todaysOrders} />
            <MetricCard label="Active Orders" value={data.activeOrders} />
            <MetricCard label="Premium Users" value={data.premiumUsers} />
          </SimpleGrid>
        )}
      </Box>
    </>
  );
};

const MetricCard = ({ label, value }) => (
  <Box p={5} bg="white" borderRadius="xl" border="1px solid" borderColor="orange.100" boxShadow="sm">
    <Text color="gray.500" fontSize="sm" mb={1}>
      {label}
    </Text>
    <Text fontSize="2xl" fontWeight="700" color="gray.800">
      {value}
    </Text>
  </Box>
);

export default AdminDashboard;
