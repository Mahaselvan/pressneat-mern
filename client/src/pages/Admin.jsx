import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || window.location.origin;
const socket = io(API_ORIGIN);

const statuses = ["Pending", "Assigned", "Picked Up", "Ironing", "Out for Delivery", "Delivered"];

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    const res = await axios.get("/orders");
    setOrders(res.data.slice().reverse());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`/orders/${id}`, { status });
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    socket.emit("statusUpdate", { orderId: id, status });
    setMessage(`Order updated to ${status}.`);
  };

  const moveRider = async (id) => {
    const lat = 12.9675 + Math.random() * 0.01;
    const lng = 79.9419 + Math.random() * 0.01;
    await axios.put(`/orders/${id}/location`, { lat, lng });
    socket.emit("riderLocation", { orderId: id, lat, lng });
    setMessage("Rider location updated.");
  };

  return (
    <>
      <Navbar />
      <Box px={5} py={8} maxW="1000px" mx="auto">
        <Heading mb={5} color="orange.500">
          Operations
        </Heading>
        {message ? (
          <Text mb={4} color="gray.600">
            {message}
          </Text>
        ) : null}
        <VStack spacing={4} align="stretch">
          {orders.map((order) => (
            <Box
              key={order._id}
              p={4}
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="orange.100"
              boxShadow="sm"
            >
              <Text fontWeight="700">{order.customerName}</Text>
              <Text fontSize="sm" color="gray.500">
                {order.phone} • {order.address}
              </Text>
              <HStack mt={3} gap={2} flexWrap="wrap">
                <select
                  style={{
                    maxWidth: "240px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #fdba74",
                    background: "white",
                  }}
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <Button size="sm" colorScheme="orange" onClick={() => moveRider(order._id)}>
                  Move Rider
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </>
  );
};

export default Admin;
