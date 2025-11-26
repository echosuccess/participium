import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { getReportMessages, sendReportMessage } from "../../api/messagesApi";
import { getReports } from "../../api/api";
import { useAuth } from "../../hooks";

const ChatDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const reportId = Number(id);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Auto-scroll to bottom only on initial load
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0 && !loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isInitialLoad.current = false;
    }
  }, [messages, loading]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Only show loading on initial load
        if (isInitialLoad.current) {
          setLoading(true);
        }
        const reports = await getReports();
        const rep = Array.isArray(reports)
          ? reports.find((r: any) => r.id === reportId)
          : null;
        setReport(rep);
        // Usa i nuovi campi citizenId e technicianId
        let rawMsgs: any[] = [];
        try {
          rawMsgs = await getReportMessages(reportId);
          console.log("Raw messages response:", rawMsgs);
        } catch (apiErr: any) {
          console.error("API error fetching messages:", apiErr);
          const backendMsg = apiErr?.message || "Failed to fetch messages";
          setError(`Server error: ${backendMsg}`);
          setMessages([]);
          if (isInitialLoad.current) {
            setLoading(false);
          }
          return;
        }
        if (!Array.isArray(rawMsgs)) {
          setError("Server error: invalid response format (not an array)");
          setMessages([]);
          if (isInitialLoad.current) {
            setLoading(false);
          }
          return;
        }
        const msgs = rep
          ? rawMsgs.map((m: any) => {
              // Check if this message was sent by the current user
              const isMine = user && user.id && m.senderId === user.id;

              // Determine sender label
              let sender = "System";

              if (m.senderId) {
                if (isMine) {
                  // If it's my message, show "Me"
                  sender = "Me";
                } else {
                  // If it's not my message, show the other user type based on my role
                  if (user && user.role === "CITIZEN") {
                    sender = "Technical Officer";
                  } else {
                    sender = "Citizen";
                  }
                }
              }

              // Format timestamp in local format
              const rawTimestamp = m.createdAt || m.timestamp;
              let formattedTimestamp = "";
              if (rawTimestamp) {
                const date = new Date(rawTimestamp);
                formattedTimestamp = date.toLocaleString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }

              return {
                sender,
                content: m.content,
                timestamp: formattedTimestamp,
                isMine,
                senderId: m.senderId,
              };
            })
          : [];
        setMessages(msgs);
      } catch (err: any) {
        console.error("ChatDetail fetchData error:", err);
        if (
          err?.message?.includes("Unexpected token") ||
          err instanceof SyntaxError
        ) {
          setError("Server error: invalid response format (JSON parse error)");
        } else {
          setError(err.message || "Failed to load chat");
        }
      } finally {
        if (isInitialLoad.current) {
          setLoading(false);
        }
      }
    }
    fetchData();

    // Set up auto-refresh every 10 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [reportId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMsg = await sendReportMessage(reportId, input);

      // When sending, the message is always from "Me"
      const rawTimestamp = newMsg.createdAt || newMsg.timestamp;
      let formattedTimestamp = "";
      if (rawTimestamp) {
        const date = new Date(rawTimestamp);
        formattedTimestamp = date.toLocaleString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      setMessages([
        ...messages,
        {
          sender: "Me",
          content: newMsg.content || input,
          timestamp: formattedTimestamp,
          isMine: true,
          senderId: user?.id,
        },
      ]);
      setInput("");
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: "2rem auto" }}>
      <Card.Header as="h5">
        {report ? (
          <>
            Report: <span style={{ fontWeight: 600 }}>{report.title}</span>
            <Button
              variant="outline-primary"
              size="sm"
              style={{ float: "right" }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </>
        ) : (
          "Loading..."
        )}
      </Card.Header>
      <Card.Body
        style={{
          background: "#f8f9fa",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "70vh",
        }}
      >
        {loading ? (
          <div style={{ padding: "1rem" }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "var(--danger)", padding: "1rem" }}>{error}</div>
        ) : (
          <>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {messages.map((msg, idx) => {
                if (!msg || typeof msg !== "object") return null;
                const sender = msg.sender ?? "System";
                const content = msg.content ?? "";
                const timestamp = msg.timestamp ?? "";
                const isMine = msg.isMine;

                // Non mostrare i messaggi di tipo System che iniziano con 'Report submitted:'
                if (
                  sender === "System" &&
                  typeof content === "string" &&
                  content.trim().toLowerCase().startsWith("report submitted:")
                ) {
                  return null;
                }

                const isAssignmentMsg =
                  typeof content === "string" &&
                  content.toLowerCase().includes("technical officer assigned");

                return (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "1.2em",
                      background: isMine
                        ? "#d1e7dd"
                        : isAssignmentMsg
                        ? "#e9ecef"
                        : "white",
                      borderRadius: "8px",
                      padding: "0.75em",
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      border: isMine ? "none" : "1px solid #dee2e6",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        color: isMine ? "#155724" : "#482F1D",
                        fontSize: "0.9em",
                      }}
                    >
                      {sender}
                    </div>
                    <div style={{ marginTop: "0.25em" }}>{content}</div>
                    <div
                      style={{
                        fontSize: "0.75em",
                        color: "#888",
                        marginTop: "0.25em",
                      }}
                    >
                      {timestamp}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div
              style={{
                borderTop: "1px solid #dee2e6",
                padding: "1rem",
                background: "white",
              }}
            >
              <form
                style={{ display: "flex", gap: "0.5em" }}
                onSubmit={handleSend}
              >
                <input
                  type="text"
                  placeholder={
                    messages.length === 0
                      ? "Send your first message to the technical officer..."
                      : "Type your message..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.5em",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                  required
                />
                <Button type="submit" variant="primary">
                  {messages.length === 0 ? "Send First Message" : "Send"}
                </Button>
              </form>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChatDetail;
