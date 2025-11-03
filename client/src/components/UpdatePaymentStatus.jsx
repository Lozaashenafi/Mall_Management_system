import { useState } from "react";
import { Button, Select, Modal, Input } from "antd"; // or any UI library

const UpdatePaymentStatus = ({ paymentId, onStatusChange }) => {
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const handleChange = (value) => {
    setStatus(value);
    setIsModalOpen(true); // show popup when admin changes status
  };

  const handleOk = async () => {
    await onStatusChange(paymentId, status, adminNote);
    setIsModalOpen(false);
    setAdminNote("");
  };

  return (
    <>
      <Select
        value={status}
        onChange={handleChange}
        options={[
          { value: "Approved", label: "Approve" },
          { value: "Rejected", label: "Reject" },
        ]}
      />
      <Modal
        title="Add Admin Note"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <p>Before updating status, please enter a reason or note:</p>
        <Input.TextArea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={4}
          placeholder="Write note here..."
        />
      </Modal>
    </>
  );
};

export default UpdatePaymentStatus;
