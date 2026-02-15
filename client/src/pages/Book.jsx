import { Box, Button, Heading, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const catalog = [
  { key: "shirts", label: "Shirts", price: 15 },
  { key: "pants", label: "Pants", price: 20 },
  { key: "sarees", label: "Sarees", price: 50 },
  { key: "uniforms", label: "Uniforms", price: 15 },
];

const Book = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [counts, setCounts] = useState({
    shirts: 0,
    pants: 0,
    sarees: 0,
    uniforms: 0,
  });
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { totalItems, totalAmount, itemsList } = useMemo(() => {
    let totalItemsCalc = 0;
    let totalAmountCalc = 0;
    const itemNames = [];

    catalog.forEach((item) => {
      const qty = counts[item.key] || 0;
      totalItemsCalc += qty;
      totalAmountCalc += qty * item.price;
      for (let i = 0; i < qty; i++) {
        itemNames.push(item.label.slice(0, -1));
      }
    });

    return {
      totalItems: totalItemsCalc,
      totalAmount: totalAmountCalc,
      itemsList: itemNames,
    };
  }, [counts]);

  const adjustCount = (key, delta) => {
    setCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const createOrder = async () => {
    if (!name || !phone || !address || totalItems === 0) {
      setMessage("Please fill details and select at least one cloth item.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/orders", {
        customerName: name,
        phone,
        address,
        items: itemsList,
        ecoSteam: false,
      });
      setOrderId(res.data._id);
      setMessage("Order created. Continue with payment.");
    } catch (error) {
      setMessage("Could not create order.");
    } finally {
      setLoading(false);
    }
  };

  const confirmAndPay = async () => {
    if (!orderId) {
      await createOrder();
      return;
    }

    try {
      const { data } = await axios.post("/payment/create-order", {
        amount: totalAmount,
        orderId,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.id,
        name: "PressNeat",
        description: "Laundry payment",
        handler: async function (response) {
          await axios.post("/payment/verify", {
            ...response,
            orderId,
          });
          setMessage("Payment successful.");
        },
        prefill: { name, contact: phone },
        theme: { color: "#F59E0B" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setMessage("Payment start failed.");
    }
  };

  return (
    <>
      <Navbar />
      <Box px={5} py={8} maxW="1150px" mx="auto">
        <Heading mb={2}>Book Ironing Service</Heading>
        <Text color="gray.600" mb={6}>
          Schedule a pickup and get your clothes ironed professionally
        </Text>

        <Box p={6} bg="white" borderRadius="2xl" border="1px solid #e5e7eb" mb={6}>
          <Heading size="md" mb={4}>
            Pickup Details
          </Heading>
          <VStack align="stretch" spacing={3}>
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Pickup Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </VStack>
        </Box>

        <Box p={6} bg="white" borderRadius="2xl" border="1px solid #e5e7eb" mb={6}>
          <Heading size="md" mb={4}>
            Select Clothes
          </Heading>
          <VStack align="stretch" spacing={3}>
            {catalog.map((item) => (
              <HStack
                key={item.key}
                justify="space-between"
                p={4}
                borderRadius="xl"
                border="1px solid #e5e7eb"
              >
                <Box>
                  <Text fontWeight="700">{item.label}</Text>
                  <Text color="gray.600">₹{item.price} per piece</Text>
                </Box>
                <HStack>
                  <Button size="sm" onClick={() => adjustCount(item.key, -1)}>
                    -
                  </Button>
                  <Text minW="24px" textAlign="center" fontWeight="700">
                    {counts[item.key]}
                  </Text>
                  <Button size="sm" onClick={() => adjustCount(item.key, 1)}>
                    +
                  </Button>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Box p={6} bg="#fff7ed" borderRadius="2xl" border="1px solid #fed7aa">
          <Heading size="md" mb={4}>
            Price Summary
          </Heading>
          <Text>Total Items: {totalItems} pieces</Text>
          <Text>Pickup Charges: Free</Text>
          <Text>Delivery Charges: Free</Text>
          <Text mt={3} fontSize="3xl" fontWeight="800" color="#1e3a8a">
            ₹{totalAmount}
          </Text>

          <Button
            mt={4}
            w="100%"
            colorScheme="orange"
            onClick={confirmAndPay}
            isLoading={loading}
            isDisabled={totalItems === 0}
          >
            Confirm & Pay
          </Button>
          {message ? <Text mt={3}>{message}</Text> : null}
        </Box>
      </Box>
    </>
  );
};

export default Book;
