import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../store/auth";
import { ApiClientError } from "../utils/apiClient";

/**
 * Comprehensive example showing how to use the API client with automatic 401 handling
 */
export function ApiExample() {
  const api = useApi();
  const { isAuthenticated, token } = useAuth();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Example 1: Simple GET request
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/users");
      setResponse(data);
      console.log("Users fetched:", data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(`Error ${err.status}: ${err.message}`);
        // 401 errors are automatically handled - user will be logged out
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 2: POST request with data
  const createUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await api.post("/api/users", {
        name: "John Doe",
        email: "john@example.com",
      });
      setResponse(newUser);
      console.log("User created:", newUser);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 3: PATCH request to update
  const updateUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.patch(`/api/users/${userId}`, {
        name: "Jane Doe",
      });
      setResponse(updated);
      console.log("User updated:", updated);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 4: DELETE request
  const deleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/users/${userId}`);
      setResponse({ message: "User deleted successfully" });
      console.log("User deleted");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 5: Request without authentication
  const publicRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/public", { skipAuth: true });
      setResponse(data);
      console.log("Public data fetched:", data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 6: Simulate 401 error (for testing)
  const simulateUnauthorized = async () => {
    setLoading(true);
    setError(null);
    try {
      // This will trigger a 401 response
      // The API client will automatically log out the user
      await api.get("/api/protected-resource-that-returns-401");
      setResponse({ message: "This won't be reached if 401 occurs" });
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setError("Session expired - you have been logged out automatically");
        } else {
          setError(`Error ${err.status}: ${err.message}`);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 7: Request with custom headers
  const customHeaderRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/data", {
        headers: {
          "X-Custom-Header": "custom-value",
        },
      });
      setResponse(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>API Client Examples with 401 Handling</h1>

      <div
        style={{ marginBottom: "20px", padding: "10px", background: "#f0f0f0" }}
      >
        <p>
          <strong>Auth Status:</strong>{" "}
          {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
        </p>
        {token && (
          <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
            <strong>Token:</strong> {token.substring(0, 20)}...
          </p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>What happens on 401?</h2>
        <p>
          When any API request returns a 401 status code, the API client will
          automatically:
        </p>
        <ol>
          <li>Log a warning to the console</li>
          <li>
            Call the <code>logout()</code> function from the auth store
          </li>
          <li>Clear the token from localStorage</li>
          <li>Redirect to the login page (via useRequireAuth hook)</li>
          <li>
            Throw an error that you can catch and handle in your component
          </li>
        </ol>
      </div>

      <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
        <button onClick={fetchUsers} disabled={loading || !isAuthenticated}>
          1. Fetch Users (GET)
        </button>
        <button onClick={createUser} disabled={loading || !isAuthenticated}>
          2. Create User (POST)
        </button>
        <button
          onClick={() => updateUser("123")}
          disabled={loading || !isAuthenticated}
        >
          3. Update User (PATCH)
        </button>
        <button
          onClick={() => deleteUser("123")}
          disabled={loading || !isAuthenticated}
        >
          4. Delete User (DELETE)
        </button>
        <button onClick={publicRequest} disabled={loading}>
          5. Public Request (no auth)
        </button>
        <button
          onClick={simulateUnauthorized}
          disabled={loading || !isAuthenticated}
          style={{ background: "#ff6b6b", color: "white" }}
        >
          6. Simulate 401 (Test Auto-Logout)
        </button>
        <button
          onClick={customHeaderRequest}
          disabled={loading || !isAuthenticated}
        >
          7. Custom Headers
        </button>
      </div>

      {loading && (
        <div
          style={{
            padding: "10px",
            background: "#fff3cd",
            marginBottom: "10px",
          }}
        >
          Loading...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "10px",
            background: "#f8d7da",
            color: "#721c24",
            marginBottom: "10px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div
          style={{
            padding: "10px",
            background: "#d4edda",
            marginBottom: "10px",
          }}
        >
          <strong>Response:</strong>
          <pre style={{ overflow: "auto" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          background: "#e7f3ff",
          borderRadius: "4px",
        }}
      >
        <h3>Code Example:</h3>
        <pre style={{ overflow: "auto", background: "white", padding: "10px" }}>
          {`import { useApi } from '../hooks/useApi';

function MyComponent() {
  const api = useApi();

  const fetchData = async () => {
    try {
      const data = await api.get('/api/users');
      // Handle success
    } catch (error) {
      // If 401, user is already logged out automatically
      // Handle other errors here
    }
  };

  return <button onClick={fetchData}>Fetch</button>;
}`}
        </pre>
      </div>
    </div>
  );
}

export default ApiExample;
