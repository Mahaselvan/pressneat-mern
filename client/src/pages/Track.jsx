import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || window.location.origin;
const socket = io(API_ORIGIN);

const statusSteps = [
  { key: "Pending", title: "Order Confirmed", description: "Your order has been confirmed" },
  { key: "Assigned", title: "Picked Up", description: "Clothes collected from your address" },
  { key: "Ironing", title: "Ironing", description: "Your clothes are being professionally ironed" },
  { key: "Out for Delivery", title: "Out for Delivery", description: "On the way to your doorstep" },
  { key: "Delivered", title: "Delivered", description: "Order delivered successfully" },
];

const mapContainerStyle = {
  width: "100%",
  height: "320px",
};

const Track = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });
  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("Fetching latest order...");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get("/orders");
        const latestOrder = res.data[res.data.length - 1];
        if (!latestOrder) {
          setMessage("No orders found yet.");
          return;
        }

        setOrder(latestOrder);
        setLocation(latestOrder.riderLocation);
        setMessage("");
        socket.emit("joinOrder", latestOrder._id);
      } catch (error) {
        setMessage("Unable to load tracking.");
      }
    };

    fetchOrder();
  }, []);

  useEffect(() => {
    socket.on("locationUpdate", (data) => setLocation(data));
    socket.on("orderStatusUpdate", (status) => {
      setOrder((prev) => (prev ? { ...prev, status } : prev));
    });

    return () => {
      socket.off("locationUpdate");
      socket.off("orderStatusUpdate");
    };
  }, []);

  const currentStepIndex = useMemo(
    () => statusSteps.findIndex((step) => step.key === order?.status),
    [order]
  );

  if (!isLoaded || !order || !location) {
    return (
      <>
        <Navbar />
        <Box p={8}>
          <Text>{message}</Text>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box px={5} py={8} maxW="1150px" mx="auto">
        <Heading mb={2}>Track Your Order</Heading>
        <Text color="gray.600" mb={6}>
          Order ID: #{order._id.slice(-6).toUpperCase()}
        </Text>

        <Box p={6} bg="white" borderRadius="2xl" border="1px solid #e5e7eb" mb={6}>
          <Heading size="md" mb={4}>
            Order Status
          </Heading>

          <VStack align="stretch" spacing={5}>
            {statusSteps.map((step, index) => {
              const active = index <= currentStepIndex;
              return (
                <HStack key={step.key} align="start" spacing={4}>
                  <Box
                    mt={1}
                    minW="36px"
                    h="36px"
                    borderRadius="full"
                    bg={active ? "#1d4ed8" : "#e5e7eb"}
                    color={active ? "white" : "gray.600"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="700"
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Text fontWeight="700" color={active ? "#0f172a" : "gray.500"}>
                      {step.title}
                    </Text>
                    <Text color="gray.600">{step.description}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {active ? "In Progress" : "Pending"}
                    </Text>
                  </Box>
                </HStack>
              );
            })}
          </VStack>
        </Box>

        <Box p={6} bg="white" borderRadius="2xl" border="1px solid #e5e7eb" mb={6}>
          <Heading size="md" mb={4}>
            Delivery Address
          </Heading>
          <Text fontWeight="600">{order.customerName}</Text>
          <Text color="gray.600">{order.address}</Text>
        </Box>

        <Box p={6} bg="white" borderRadius="2xl" border="1px solid #e5e7eb" mb={6}>
          <Heading size="md" mb={4}>
            Order Summary
          </Heading>
          <Text>Total Items: {order.pieceCount}</Text>
          <Text>Pickup Charges: Free</Text>
          <Text>Delivery Charges: Free</Text>
          <Text mt={3} fontWeight="700" fontSize="2xl">
            Total Paid: ₹{order.totalPrice}
          </Text>
          {order.paymentStatus === "Paid" ? (
            <Button
              mt={4}
              colorScheme="green"
              onClick={() => window.open(`${API_ORIGIN}/invoices/invoice_${order._id}.pdf`)}
            >
              Download Invoice
            </Button>
          ) : null}
        </Box>

        <Box p={6} bg="white" borderRadius="2xl" border="1px solid #e5e7eb">
          <Heading size="md" mb={4}>
            Live Rider Map
          </Heading>
          <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={location}>
            <Marker position={location} />
          </GoogleMap>
        </Box>
      </Box>
    </>
  );
};

export default Track;
