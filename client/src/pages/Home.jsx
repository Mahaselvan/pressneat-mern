import { Box, Heading, Text, Button, Input } from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useState } from "react";

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [pincode, setPincode] = useState("");
  const [available, setAvailable] = useState(null);

  const checkPincode = async () => {
    const res = await axios.get(`/service/${pincode}`);
    setAvailable(res.data.available);
  };
  return (
    <>
      <Navbar />
      <Box textAlign="center" mt={20}>
        <Heading color="orange.400">
          Ironing in 60 mins in Srīperumbūdūr
        </Heading>
        <Text mt={4}>Starting at ₹10 per piece</Text>
        <Link to="/book">
          <Button mt={6} colorScheme="orange">
            Book Now
          </Button>
        </Link>
        <Button
          colorScheme="purple"
          onClick={async () => {
            if (!user?._id) {
              navigate("/login");
              return;
            }
            await axios.post(`/subscription/${user._id}`);
          }}
        >
          Upgrade to Premium ₹499/month
        </Button>
 <Input
  placeholder="Enter Pincode"
  mt={4}
  onChange={(e) => setPincode(e.target.value)}
/>

<Button mt={2} colorScheme="orange" onClick={checkPincode}>
  Check Availability
</Button>

{available !== null && (
  <Text mt={3} color={available ? "green.500" : "red.500"}>
    {available
      ? "Service Available in Your Area 🚀"
      : "Sorry, we don't serve here yet."}
  </Text>
)}

      </Box>
    </>
  );
};

export default Home;
