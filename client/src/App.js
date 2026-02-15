<Route
  path="/book"
  element={
    <ProtectedRoute>
      <Book />
    </ProtectedRoute>
  }
/>
