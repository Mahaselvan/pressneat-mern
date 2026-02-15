import {
  Box,
  Heading,
  Button,
  Text,
  VStack,
  Progress
} from "@chakra-ui/react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";

const socket = io("http://localhost:5000");

const mapContainerStyle = {
  width: "100%",
  height: "400px"
};

const statusSteps = [
  "Pending",
  "Assigned",
  "Picked Up",
  "Ironing",
  "Out for Delivery",
  "Delivered"
];

const Track = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API
  });

  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);

  // Fetch latest order
  useEffect(() => {
    const fetchOrder = async () => {
      const res = await axios.get("/orders");
      const latestOrder = res.data[res.data.length - 1];

      if (latestOrder) {
        setOrder(latestOrder);
        setLocation(latestOrder.riderLocation);

        socket.emit("joinOrder", latestOrder._id);
      }
    };

    fetchOrder();
  }, []);

  // Listen for live location updates
  useEffect(() => {
    socket.on("locationUpdate", (data) => {
      setLocation(data);
    });
    socket.on("orderStatusUpdate", (status) => {
  setOrder((prev) => ({
    ...prev,
    status
  }));
});

    return () => {
      socket.off("locationUpdate");
      socket.off("orderStatusUpdate");
    };
  }, []);

  if (!isLoaded || !order || !location)
    return <div>Loading...</div>;

  const progress =
    (statusSteps.indexOf(order.status) /
      (statusSteps.length - 1)) *
    100;

  return (
    <Box p={6}>
      <Heading mb={4}>Live Rider Tracking</Heading>

      <VStack spacing={4} align="stretch">
        <Box shadow="md" p={4} borderRadius="lg">
          <Text fontWeight="bold">
            Order ID: {order._id}
          </Text>
          <Text>Status: {order.status}</Text>

          <Progress
            value={progress}
            colorScheme="orange"
            mt={3}
          />

          {order.paymentStatus === "Paid" && (
            <Button
              mt={3}
              colorScheme="green"
              onClick={() =>
                window.open(
                  `http://localhost:5000/invoices/invoice_${order._id}.pdf`
                )
              }
            >
              Download Invoice
            </Button>
          )}
          {order.videoProof && (
  <Box mt={4}>
    <Text fontWeight="bold" mb={2}>
      Ironing Video Proof
    </Text>

    <video width="100%" controls>
      <source
        src={`http://localhost:5000${order.videoProof}`}
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>
  </Box>
)}

        </Box>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={location}
        >
          <Marker position={location} />
        </GoogleMap>
      </VStack>
    </Box>
  );
};

export default Track;
