import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { getReportMessages, sendReportMessage } from "../../api/messagesApi";
import { getReports } from "../../api/api";

const ChatDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportId = Number(id);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const reports = await getReports();
        const rep = Array.isArray(reports) ? reports.find((r: any) => r.id === reportId) : null;
        setReport(rep);
        // Usa i nuovi campi citizenId e technicianId
        let rawMsgs: any[] = [];
        try {
          rawMsgs = await getReportMessages(reportId);
          console.log("Raw messages response:", rawMsgs);
        } catch (apiErr: any) {
          console.error("API error fetching messages:", apiErr);
          let backendMsg = "";
          if (apiErr?.response && apiErr.response.data) {
            backendMsg = typeof apiErr.response.data === "string"
              ? apiErr.response.data
              : apiErr.response.data.message || JSON.stringify(apiErr.response.data);
          } else if (apiErr?.message) {
            backendMsg = apiErr.message;
          }
          setError(`Server error: ${backendMsg || "invalid response format (API error)"}`);
          setMessages([]);
          setLoading(false);
          return;
        }
        if (!Array.isArray(rawMsgs)) {
          setError("Server error: invalid response format (not an array)");
          setMessages([]);
          setLoading(false);
          return;
        }
        const msgs = rep
          ? rawMsgs.map((m: any) => {
              let sender = "System";
              if (m.senderId) {
                if (rep.citizenId && m.senderId === rep.citizenId) {
                  sender = "Citizen";
                } else if (rep.technicianId && m.senderId === rep.technicianId) {
                  sender = "Technical Officer";
                } else if (m.senderId === rep.id) {
                  sender = "Citizen";
                } else {
                  sender = "Technical Officer";
                }
              }
              return {
                sender,
                content: m.content,
                timestamp: m.createdAt || m.timestamp || new Date().toLocaleString(),
                isMine: false, // cannot check ownership without userId
              };
            })
          : [];
        setMessages(msgs);
      } catch (err: any) {
        console.error("ChatDetail fetchData error:", err);
        if (err?.message?.includes('Unexpected token') || err instanceof SyntaxError) {
          setError("Server error: invalid response format (JSON parse error)");
        } else {
          setError(err.message || "Failed to load chat");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [reportId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMsg = await sendReportMessage(reportId, input);
      setMessages([
        ...messages,
        {
          sender: "Citizen", // Assume sender is always the logged-in user
          content: newMsg.content || input,
          timestamp: newMsg.timestamp || new Date().toLocaleString(),
          isMine: true,
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
      <Card.Body style={{ background: "#f8f9fa" }}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "var(--danger)" }}>{error}</div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              if (!msg || typeof msg !== "object") return null;
              const sender = msg.sender ?? "System";
              const content = msg.content ?? "";
              const timestamp = msg.timestamp ?? "";
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
              // Stile diverso per messaggi del cittadino
              const isMine = msg.isMine;
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: "1.2em",
                    background: isMine ? "#d1e7dd" : isAssignmentMsg ? "#e9ecef" : undefined,
                    borderRadius: "8px",
                    padding: "0.75em",
                    alignSelf: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      color: sender === "Citizen" ? "var(--primary)" : "#482F1D",
                    }}
                  >
                    {sender}
                  </div>
                  <div>{content}</div>
                  <div style={{ fontSize: "0.8em", color: "#888" }}>
                    {timestamp}
                  </div>
                </div>
              );
            })}
            <form
              style={{ marginTop: "2em", display: "flex", gap: "0.5em" }}
              onSubmit={handleSend}
            >
              <input
                type="text"
                placeholder={messages.length === 0 ? "Send your first message to the technical officer..." : "Type your message..."}
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
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChatDetail;
