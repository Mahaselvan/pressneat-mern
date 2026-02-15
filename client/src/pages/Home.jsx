import { Box, Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  const checkPincode = async () => {
    try {
      setChecking(true);
      const res = await axios.get(`/service/${pincode}`);
      setMessage(
        res.data.available
          ? `Service available. Delivery charge ₹${res.data.deliveryCharge}.`
          : "Sorry, this pincode is currently not serviceable."
      );
    } catch (error) {
      setMessage("Unable to check pincode right now.");
    } finally {
      setChecking(false);
    }
  };

  const upgradePremium = async () => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(`/subscription/${user._id}`);
      setMessage("Premium upgrade activated for 1 month.");
    } catch (error) {
      setMessage("Could not upgrade right now.");
    }
  };

  return (
    <>
      <Navbar />
      <Box px={{ base: 5, md: 10 }} py={{ base: 10, md: 16 }}>
        <Box
          maxW="900px"
          mx="auto"
          p={{ base: 6, md: 10 }}
          borderRadius="2xl"
          bg="white"
          border="1px solid"
          borderColor="orange.100"
          boxShadow="0 10px 35px rgba(251, 146, 60, 0.18)"
        >
          <VStack align="stretch" spacing={5}>
            <Text fontSize="sm" fontWeight="700" color="orange.500" letterSpacing="1px">
              SAME DAY IRONING
            </Text>
            <Heading size="2xl" lineHeight="1.2">
              PressNeat: pickup, steam, and delivery in under 60 minutes
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Live rider tracking, payment verification, invoice download, and video proof.
            </Text>

            <Box display="flex" gap={3} flexWrap="wrap">
              <Button colorScheme="orange" onClick={() => navigate("/book")}>
                Book Now
              </Button>
              <Button variant="outline" colorScheme="orange" onClick={upgradePremium}>
                Upgrade Premium ₹499/month
              </Button>
            </Box>

            <Box
              mt={2}
              p={4}
              bg="orange.50"
              borderRadius="lg"
              border="1px solid"
              borderColor="orange.100"
            >
              <Text fontWeight="600" mb={2}>
                Check serviceability
              </Text>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Input
                  maxW="280px"
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
                <Button colorScheme="orange" onClick={checkPincode} isLoading={checking}>
                  Check
                </Button>
              </Box>
              {message ? (
                <Text mt={2} color="gray.700">
                  {message}
                </Text>
              ) : null}
            </Box>
          </VStack>
        </Box>
      </Box>
    </>
  );
};

export default Home;
