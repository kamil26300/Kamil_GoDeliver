import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message } from "antd";
import axios from "axios";

const OTPModal = ({ visible, onCancel, bookingId, status, onSuccess }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    let timer;
    if (visible && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible, remainingTime]);

  useEffect(() => {
    if (visible) {
      sendOTP();
    }
  }, [visible]);

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        status === "accepted"
          ? `/api/bookings/${bookingId}/start-otp`
          : `/api/bookings/${bookingId}/end-otp`;
      await axios.post(endpoint);
      message.success("OTP sent successfully");
      setRemainingTime(300);
    } catch (error) {
      message.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to the next input
    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleSubmit = async () => {
    if (otp.some((digit) => !digit)) {
      message.error("Please enter all 4 digits of the OTP");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        status === "accepted"
          ? `/api/bookings/${bookingId}/validate-start-otp`
          : `/api/bookings/${bookingId}/validate-end-otp`;
      await axios.post(endpoint, { otp: otp.join("") });
      message.success("OTP validated successfully");
      onSuccess(status === "accepted" ? "in-progress" : "completed");
      onCancel();
    } catch (error) {
      message.error("Invalid OTP");
    } finally {
      setOtp(["", "", "", ""]);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title={`Enter OTP to ${status === "accepted" ? "Start" : "End"} Delivery`}
      onCancel={onCancel}
      footer={null}
    >
      <div className="flex justify-center space-x-2 mb-4">
        {otp.map((digit, index) => (
          <Input
            key={index}
            id={`otp-input-${index}`}
            className="w-12 h-12 text-center text-2xl"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            maxLength={1}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <Button onClick={sendOTP} disabled={isLoading || remainingTime > 0}>
          {remainingTime > 0
            ? `Resend OTP (${Math.floor(remainingTime / 60)}:${(
                remainingTime % 60
              )
                .toString()
                .padStart(2, "0")})`
            : "Resend OTP"}
        </Button>
        <Button type="primary" onClick={handleSubmit} loading={isLoading}>
          Submit
        </Button>
      </div>
    </Modal>
  );
};

export default OTPModal;
