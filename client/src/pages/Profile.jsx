import { Box, Heading, Text } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <Box maxW="600px" mx="auto" mt={10} p={6} shadow="md" borderRadius="lg">
      <Heading size="lg" mb={4}>
        Profile
      </Heading>
      {user ? (
        <>
          <Text><b>Name:</b> {user.name}</Text>
          <Text><b>Phone:</b> {user.phone}</Text>
          <Text><b>Role:</b> {user.role}</Text>
          <Text><b>Plan:</b> {user.subscription || "Free"}</Text>
        </>
      ) : (
        <Text>Please login to view your profile.</Text>
      )}
    </Box>
  );
};

export default Profile;
