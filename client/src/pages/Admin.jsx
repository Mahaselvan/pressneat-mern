import {
  Box,
  Select,
  Button,
  VStack,
  Heading,
  Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { io } from "socket.io-client";
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || window.location.origin;
const socket = io(API_ORIGIN);
const sendLiveLocation = (orderId) => {
  const lat = 12.9675 + Math.random() * 0.01;
  const lng = 79.9419 + Math.random() * 0.01;

  socket.emit("riderLocation", {
    orderId,
    lat,
    lng
  });

socket.emit("statusUpdate", {
  orderId,
  status: "Ironing"
});
};
const statuses = [
  "Pending",
  "Assigned",
  "Picked Up",
  "Ironing",
  "Out for Delivery",
  "Delivered"
];

const Admin = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("/orders").then((res) => {
      setOrders(res.data);
    });
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`/orders/${id}`, { status });
    window.location.reload();
  };
const moveRider = async (id) => {
  const randomLat = 12.9675 + Math.random() * 0.01;
  const randomLng = 79.9419 + Math.random() * 0.01;

  await axios.put(`/orders/${id}/location`, {
    lat: randomLat,
    lng: randomLng
  });
};

  return (
    <Box p={6}>
      <Heading mb={6}>Admin Dashboard</Heading>

      <VStack spacing={4}>
        {orders.map((order) => (
          <Box key={order._id} p={4} shadow="md" w="100%">
            <Text>{order.customerName}</Text>
            <Select
              defaultValue={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Button
  size="sm"
  mt={2}
  colorScheme="orange"
  onClick={() => moveRider(order._id)}
>
  Move Rider
</Button>
<Button
  size="sm"
  mt={2}
  colorScheme="orange"
  onClick={() => sendLiveLocation(order._id)}
>
  Send Live Location
</Button>

          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Admin;
