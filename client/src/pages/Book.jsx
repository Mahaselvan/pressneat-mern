import {
  Box,
  Input,
  Button,
  Checkbox,
  Heading,
  VStack,
  Text,
  Badge
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "../api/axios";

const Book = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState("");
  const [eco, setEco] = useState(false);

  const handleSubmit = async () => {
    await axios.post("/orders", {
      customerName: name,
      phone,
      address,
      items: items.split(","),
      ecoSteam: eco
    });

    alert("Order Placed Successfully!");
  };
const handlePayment = async () => {
  // Step 1: Create Razorpay order
  const { data } = await axios.post("/payment/create-order", {
    amount: 200
  });

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: data.amount,
    currency: "INR",
    order_id: data.id,

    handler: async function (response) {
      await axios.post("/payment/verify", {
        ...response,
        orderId: data.id
      });

      alert("Payment Successful!");
    },

    prefill: {
      name: name,
      contact: phone
    },

    theme: {
      color: "#F97316"
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

  return (
    <Box maxW="500px" mx="auto" mt="50px" p={6} shadow="md" borderRadius="lg">
      <Heading mb={6} color="orange.400">
        Book Ironing
      </Heading>

      <VStack spacing={4}>
        <Input placeholder="Your Name" onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="Pickup Address" onChange={(e) => setAddress(e.target.value)} />

        <Input
          placeholder="Items (shirt,saree,pant)"
          onChange={(e) => setItems(e.target.value)}
        />

        <Checkbox colorScheme="orange" onChange={() => setEco(!eco)}>
          Eco Steam (+₹2 per piece)
        </Checkbox>

        <Button colorScheme="orange" w="100%" onClick={handleSubmit}>
          Confirm Booking
        </Button>

        <Button colorScheme="orange" w="100%" onClick={handlePayment} variant="outline">
          Proceed to Payment
        </Button>

        <Badge colorScheme="green">
          ₹12 per piece • 60 min service
        </Badge>
      </VStack>
    </Box>
  );
};

export default Book;
