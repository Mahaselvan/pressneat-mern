import { Badge, Box, Button, Checkbox, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const Book = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState("");
  const [ecoSteam, setEcoSteam] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedItems = useMemo(
    () => items.split(",").map((item) => item.trim()).filter(Boolean),
    [items]
  );

  const estimate = parsedItems.length * (12 + (ecoSteam ? 2 : 0));

  const handleSubmit = async () => {
    if (!name || !phone || !address || parsedItems.length === 0) {
      setMessage("Please complete all booking details.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/orders", {
        customerName: name,
        phone,
        address,
        items: parsedItems,
        ecoSteam,
      });
      setOrderId(res.data._id);
      setTotalPrice(res.data.totalPrice);
      setMessage("Booking confirmed. You can proceed to payment.");
    } catch (error) {
      setMessage("Unable to create booking right now.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderId) {
      setMessage("Create booking first.");
      return;
    }

    try {
      const { data } = await axios.post("/payment/create-order", {
        amount: totalPrice,
        orderId,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.id,
        name: "PressNeat",
        description: "Ironing Service Payment",
        handler: async function (response) {
          await axios.post("/payment/verify", {
            ...response,
            orderId,
          });
          setMessage("Payment successful.");
        },
        prefill: {
          name,
          contact: phone,
        },
        theme: {
          color: "#F97316",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setMessage("Payment initialization failed.");
    }
  };

  return (
    <>
      <Navbar />
      <Box px={5} py={8}>
        <Box
          maxW="560px"
          mx="auto"
          p={7}
          bg="white"
          border="1px solid"
          borderColor="orange.100"
          borderRadius="2xl"
          boxShadow="0 10px 32px rgba(251, 146, 60, 0.16)"
        >
          <Heading mb={6} color="orange.500" size="lg">
            Book Ironing Pickup
          </Heading>

          <VStack spacing={4}>
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Pickup Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input
              placeholder="Items comma separated (shirt,saree,pant)"
              value={items}
              onChange={(e) => setItems(e.target.value)}
            />
            <Checkbox colorScheme="orange" isChecked={ecoSteam} onChange={() => setEcoSteam((v) => !v)}>
              Eco Steam (+₹2 per piece)
            </Checkbox>

            <Box w="100%" p={3} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.100">
              <Text fontSize="sm">Items: {parsedItems.length}</Text>
              <Text fontWeight="600">Estimated total: ₹{estimate}</Text>
            </Box>

            <Button colorScheme="orange" w="100%" onClick={handleSubmit} isLoading={loading}>
              Confirm Booking
            </Button>
            <Button
              colorScheme="orange"
              w="100%"
              variant="outline"
              onClick={handlePayment}
              isDisabled={!orderId}
            >
              Proceed to Payment
            </Button>
            <Badge colorScheme="green">₹12 base per piece • Fast delivery</Badge>
            {message ? <Text fontSize="sm">{message}</Text> : null}
          </VStack>
        </Box>
      </Box>
    </>
  );
};

export default Book;
