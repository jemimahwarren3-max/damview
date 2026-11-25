"use client";

import { useState } from "react";
import { checkInGuest } from "@/lib/actions/guests";
import { Database } from "@/types/database.types";
import { UserPlus, BedDouble, User, Users, Tag, Mail, FileText } from "lucide-react";
import toast from "react-hot-toast";

type Room = Pick<
  Database["public"]["Tables"]["rooms"]["Row"],
  "id" | "room_number" | "type" | "base_price"
>;

export default function CheckInForm({
  availableRooms,
}: {
  availableRooms: Room[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(
    availableRooms[0] || null,
  );
  const [roomId, setRoomId] = useState(selectedRoom?.id || "");
  const [mainName, setMainName] = useState("");
  const [otherNames, setOtherNames] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [idProofName, setIdProofName] = useState("National ID");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [peopleCount, setPeopleCount] = useState<string>("1");
  const [rate, setRate] = useState<string>(
    String(selectedRoom?.base_price || 0),
  );
  const [gstPercent, setGstPercent] = useState(15);
  const [gstNumber, setGstNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    setRoomId(rId);
    const room = availableRooms.find((r) => r.id === rId);
    if (room) {
      setSelectedRoom(room);
      setRate(String(room.base_price));
    }
  };

  const handlePeopleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10);
    setPeopleCount(e.target.value);
    if (!isNaN(count) && count > 1) {
      const newOtherNames = [...otherNames];
      if (newOtherNames.length < count - 1) {
        while (newOtherNames.length < count - 1) newOtherNames.push("");
      } else {
        newOtherNames.splice(count - 1);
      }
      setOtherNames(newOtherNames);
    } else {
      setOtherNames([]);
    }
  };

  const handleOtherNameChange = (index: number, value: string) => {
    const newOtherNames = [...otherNames];
    newOtherNames[index] = value;
    setOtherNames(newOtherNames);
  };

  const [phoneError, setPhoneError] = useState("");
  const [idError, setIdError] = useState("");

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 0 && (digits.length < 7 || digits.length > 15)) {
      setPhoneError("Phone must be between 7 and 15 digits");
    } else {
      setPhoneError("");
    }
    setPhone(value);
  };

  const validateIdProof = (value: string) => {
    if (value.trim().length > 0 && value.trim().length < 4) {
      setIdError("ID number must be at least 4 characters");
    } else {
      setIdError("");
    }
    setIdProofNumber(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      toast.error("Phone number must be between 7 and 15 digits.");
      return;
    }
    if (idProofNumber.trim().length < 4) {
      toast.error("ID number must be at least 4 characters.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("room_id", roomId);
    formData.append("name", mainName);
    formData.append("other_guest_names", JSON.stringify(otherNames));
    formData.append("phone", phone);
    formData.append("id_proof_name", idProofName);
    formData.append("id_proof_number", idProofNumber);
    formData.append("people_count", peopleCount);
    formData.append("rate", rate);
    formData.append("gst_percent", gstPercent.toString());
    if (gstNumber.trim()) formData.append("gst_number", gstNumber.trim());
    if (email.trim()) formData.append("email", email.trim());

    const { error } = await checkInGuest(formData);
    if (error) {
      toast.error(error);
    } else {
      setMainName("");
      setOtherNames([]);
      setPhone("");
      setPhoneError("");
      setIdProofNumber("");
      setIdError("");
      setPeopleCount("1");
      setGstPercent(15);
      setGstNumber("");
      setEmail("");
      toast.success("Guest checked in successfully!");
    }
    setLoading(false);
  };

  if (availableRooms.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3 border border-amber-200">
          <BedDouble className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-sm text-amber-600 font-bold">All rooms occupied</p>
        <p className="text-xs text-neutral-500 mt-1">
          No rooms available for check-in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Room Selection */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
          <BedDouble className="h-3.5 w-3.5 text-neutral-500" /> Room
        </label>
        <select
          required
          value={roomId}
          onChange={handleRoomChange}
          className="premium-select"
        >
          {availableRooms.map((room) => (
            <option key={room.id} value={room.id}>
              Room {room.room_number} ({room.type}) — ${room.base_price}
            </option>
          ))}
        </select>
        {selectedRoom && (
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-50 text-neutral-900 font-bold border border-neutral-300 capitalize">
              {selectedRoom.type}
            </span>
            <span>${selectedRoom.base_price}/night</span>
          </div>
        )}
      </div>

      {/* People & Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
            <Users className="h-3.5 w-3.5 text-neutral-500" /> People
          </label>
          <input
            type="number"
            required
            min="1"
            value={peopleCount}
            onChange={handlePeopleCountChange}
            className="premium-input"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
            <Tag className="h-3.5 w-3.5 text-neutral-500" /> Rate ($/Night)
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="premium-input"
            style={{ fontWeight: 700, color: "#1d4ed8" }}
          />
        </div>
      </div>

      {/* Guest Names */}
      <div className="space-y-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
            <User className="h-3.5 w-3.5 text-neutral-500" /> Primary Guest Name
          </label>
          <input
            type="text"
            required
            value={mainName}
            onChange={(e) => setMainName(e.target.value)}
            className="premium-input"
            placeholder="Full name"
          />
        </div>

        {otherNames.map((name, idx) => (
          <div key={idx} className="animate-fade-in">
            <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
              <User className="h-3.5 w-3.5 text-neutral-500" /> Guest {idx + 2}{" "}
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleOtherNameChange(idx, e.target.value)}
              className="premium-input"
              placeholder={`Guest ${idx + 2} name`}
            />
          </div>
        ))}
      </div>

      {/* Phone & ID Proof */}
      <div className="space-y-4 pt-2 border-t border-neutral-100">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => validatePhone(e.target.value)}
            maxLength={15}
            className={`premium-input ${phoneError ? "border-rose-300 focus:ring-rose-200" : ""}`}
            placeholder="Phone number"
          />
          {phoneError && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              {phoneError}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
              ID Proof Type
            </label>
            <select
              value={idProofName}
              onChange={(e) => {
                setIdProofName(e.target.value);
                setIdError("");
              }}
              className="premium-select"
            >
              <option value="National ID">National ID</option>
              <option value="Passport">Passport</option>
              <option value="Driver's License">Driver&apos;s License</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
              ID Number
            </label>
            <input
              type="text"
              required
              value={idProofNumber}
              onChange={(e) => validateIdProof(e.target.value)}
              className={`premium-input ${idError ? "border-rose-300 focus:ring-rose-200" : ""}`}
              placeholder="Full ID number"
            />
            {idError && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">
                {idError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tax Number & Email (Optional) */}
      <div className="space-y-4 pt-2 border-t border-neutral-100">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
            <FileText className="h-3.5 w-3.5 text-neutral-500" /> Tax Number
            <span className="text-[10px] font-medium text-neutral-400 normal-case tracking-normal ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            className="premium-input"
            placeholder="Tax registration number"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
            <Mail className="h-3.5 w-3.5 text-neutral-500" /> Email
            <span className="text-[10px] font-medium text-neutral-400 normal-case tracking-normal ml-1">(Optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="premium-input"
            placeholder="guest@example.com"
          />
        </div>
      </div>

      {/* Tax Rate */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
          Tax Rate
        </label>
        <div className="flex gap-2">
          {[0, 15, 25].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setGstPercent(val)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                gstPercent === val
                  ? "bg-neutral-900 text-white shadow-sm shadow-neutral-200 border-neutral-300"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              {val}%
            </button>
          ))}
          <div className="flex-1 relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={![0, 15, 25].includes(gstPercent) ? gstPercent : ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v >= 0 && v <= 100) setGstPercent(v);
              }}
              onFocus={() => {
                if ([0, 15, 25].includes(gstPercent)) setGstPercent(0);
              }}
              placeholder="Custom"
              className={`w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all border outline-none ${
                ![0, 15, 25].includes(gstPercent)
                  ? "bg-neutral-900 text-white border-neutral-300 shadow-sm shadow-neutral-200 placeholder-neutral-200"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 placeholder-neutral-400"
              }`}
            />
          </div>
        </div>
        {gstPercent > 0 && (
          <p className="text-xs text-neutral-500 font-medium mt-1.5">
            Tax at {gstPercent}% will be applied
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-3.5 font-bold text-sm text-white shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: "#171717" }}
      >
        <UserPlus className="h-4 w-4" />
        {loading ? "Checking in..." : "Confirm Check-in"}
      </button>
    </form>
  );
}
