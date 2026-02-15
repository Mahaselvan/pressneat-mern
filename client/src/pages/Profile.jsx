import { Box, Heading, Text } from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Box px={5} py={8}>
        <Box
          maxW="600px"
          mx="auto"
          p={7}
          bg="white"
          border="1px solid"
          borderColor="orange.100"
          borderRadius="2xl"
          boxShadow="sm"
        >
          <Heading size="lg" mb={5} color="orange.500">
            Profile
          </Heading>
          {user ? (
            <>
              <Text mb={2}><b>Name:</b> {user.name}</Text>
              <Text mb={2}><b>Phone:</b> {user.phone}</Text>
              <Text mb={2}><b>Role:</b> {user.role}</Text>
              <Text><b>Plan:</b> {user.subscription || "Free"}</Text>
            </>
          ) : (
            <Text>Please login to view your details.</Text>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Profile;
