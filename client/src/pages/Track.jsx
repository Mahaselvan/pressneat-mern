import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || window.location.origin;
const socket = io(API_ORIGIN);

const statusSteps = ["Pending", "Assigned", "Picked Up", "Ironing", "Out for Delivery", "Delivered"];

const mapContainerStyle = {
  width: "100%",
  height: "360px",
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
        setMessage("Unable to load order tracking.");
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

  const progress = (statusSteps.indexOf(order.status) / (statusSteps.length - 1)) * 100;

  return (
    <>
      <Navbar />
      <Box p={6} maxW="1000px" mx="auto">
        <Heading mb={4} color="orange.500">
          Live Rider Tracking
        </Heading>

        <VStack spacing={4} align="stretch">
          <Box p={4} borderRadius="xl" bg="white" border="1px solid" borderColor="orange.100">
            <Text fontWeight="700">Order: {order._id}</Text>
            <Text>Status: {order.status}</Text>
            <Box mt={3} h="10px" bg="orange.100" borderRadius="full" overflow="hidden">
              <Box
                h="100%"
                bg="orange.500"
                width={`${Math.max(0, Math.min(100, progress))}%`}
                transition="width 0.3s ease"
              />
            </Box>

            {order.paymentStatus === "Paid" ? (
              <Button
                mt={3}
                colorScheme="green"
                onClick={() => window.open(`${API_ORIGIN}/invoices/invoice_${order._id}.pdf`)}
              >
                Download Invoice
              </Button>
            ) : null}

            {order.videoProof ? (
              <Box mt={4}>
                <Text fontWeight="600" mb={2}>
                  Video Proof
                </Text>
                <video width="100%" controls>
                  <source src={`${API_ORIGIN}${order.videoProof}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </Box>
            ) : null}
          </Box>

          <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={location}>
            <Marker position={location} />
          </GoogleMap>
        </VStack>
      </Box>
    </>
  );
};

export default Track;
