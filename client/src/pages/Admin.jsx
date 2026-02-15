import { Box, Button, Heading, HStack, Select, Text, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || window.location.origin;
const socket = io(API_ORIGIN);

const statuses = ["Pending", "Assigned", "Picked Up", "Ironing", "Out for Delivery", "Delivered"];

const getNextStatus = (status) => {
  const index = statuses.indexOf(status);
  if (index < 0 || index >= statuses.length - 1) return status;
  return statuses[index + 1];
};

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All Orders");
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async (status = filter) => {
    try {
      setLoading(true);
      const query = status === "All Orders" ? "" : `?status=${encodeURIComponent(status)}`;
      const res = await axios.get(`/admin/orders${query}`);
      setOrders(res.data);
      setMessage("");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadOrders("All Orders");
  }, [loadOrders]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
      socket.emit("statusUpdate", { orderId: id, status });
      setMessage(`Order #${id.slice(-6).toUpperCase()} updated to ${status}`);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update order status");
    }
  };

  const moveRider = async (id) => {
    try {
      const lat = 12.9675 + Math.random() * 0.01;
      const lng = 79.9419 + Math.random() * 0.01;
      await axios.put(`/orders/${id}/location`, { lat, lng });
      socket.emit("riderLocation", { orderId: id, lat, lng });
      setMessage("Rider location updated.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to update rider location");
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    const inProgress = total - delivered;
    return { total, delivered, inProgress };
  }, [orders]);

  return (
    <>
      <Navbar />
      <Box px={{ base: 4, md: 6 }} py={8} maxW="1100px" mx="auto">
        <Heading mb={2} color="orange.500">
          Admin Operations
        </Heading>
        <Text color="gray.600" mb={5}>
          Confirm pickup, move ironing flow, and mark deliveries in real time.
        </Text>

        <HStack mb={4} spacing={3} flexWrap="wrap">
          <StatBadge label="Total Orders" value={stats.total} />
          <StatBadge label="In Progress" value={stats.inProgress} />
          <StatBadge label="Delivered" value={stats.delivered} />
        </HStack>

        <HStack mb={4} spacing={3} flexWrap="wrap">
          <Select
            maxW="220px"
            value={filter}
            onChange={(e) => {
              const selected = e.target.value;
              setFilter(selected);
              loadOrders(selected);
            }}
            bg="white"
          >
            <option>All Orders</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </Select>
          <Button variant="outline" onClick={() => loadOrders(filter)} isLoading={loading}>
            Refresh
          </Button>
        </HStack>

        {message ? (
          <Text mb={4} color="gray.700">
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
              <HStack justify="space-between" align="start" flexWrap="wrap">
                <Box>
                  <Text fontWeight="700">
                    #{order._id.slice(-6).toUpperCase()} • {order.customerName}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {order.phone} • {order.address} • {order.pincode}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {order.pieceCount} items • ₹{order.totalPrice} • {order.paymentStatus}
                  </Text>
                </Box>
                <Text fontWeight="700" color="blue.700">
                  {order.status}
                </Text>
              </HStack>

              <HStack mt={3} gap={2} flexWrap="wrap">
                <Select
                  maxW="230px"
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  bg="white"
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  colorScheme="orange"
                  onClick={() => updateStatus(order._id, getNextStatus(order.status))}
                  isDisabled={order.status === "Delivered"}
                >
                  Move to Next Step
                </Button>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => updateStatus(order._id, "Delivered")}
                  isDisabled={order.status === "Delivered"}
                >
                  Confirm Delivery
                </Button>
                <Button size="sm" variant="outline" onClick={() => moveRider(order._id)}>
                  Update Rider Location
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </>
  );
};

const StatBadge = ({ label, value }) => (
  <Box bg="white" border="1px solid #e5e7eb" borderRadius="lg" px={3} py={2}>
    <Text fontSize="xs" color="gray.500">
      {label}
    </Text>
    <Text fontWeight="700">{value}</Text>
  </Box>
);

export default Admin;
