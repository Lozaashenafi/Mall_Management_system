// components/security/SecurityVerificationModal.jsx
import { useState } from "react";
import { Shield, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { verifyExitRequest } from "../../services/securityExitRequestService";

export default function SecurityVerificationModal({
  isOpen,
  onClose,
  request,
  onComplete,
}) {
  const [status, setStatus] = useState("Verified");
  const [securityNote, setSecurityNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!securityNote.trim() && status === "Blocked") {
      toast.error("Please provide a reason for blocking");
      return;
    }

    if (status === "Blocked" && securityNote.length > 1000) {
      toast.error("Note cannot exceed 1000 characters");
      return;
    }

    try {
      setLoading(true);
      await verifyExitRequest(request.requestId, {
        status,
        securityNote: securityNote.trim(),
      });

      toast.success(`Exit request ${status.toLowerCase()} successfully!`);
      onComplete();
    } catch (error) {
      toast.error(error.message || "Failed to process verification");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Security Verification
                  </h3>
                  <div className="mt-2">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Tracking #</p>
                          <p className="font-semibold">
                            {request.trackingNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tenant</p>
                          <p className="font-semibold">
                            {request.tenant?.user?.fullName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Unit</p>
                          <p className="font-semibold">
                            {request.rental?.room?.unitNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Exit Date</p>
                          <p className="font-semibold">
                            {new Date(request.exitDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Verification Action *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setStatus("Verified")}
                          className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                            status === "Verified"
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Verify & Allow</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus("Blocked")}
                          className={`p-3 border rounded-lg flex items-center justify-center gap-2 ${
                            status === "Blocked"
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span>Block & Deny</span>
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        Security Note {status === "Blocked" && "*"}
                        <span className="text-gray-500 text-xs ml-2">
                          {status === "Blocked"
                            ? "(Required for blocking)"
                            : "(Optional)"}
                        </span>
                      </label>
                      <textarea
                        value={securityNote}
                        onChange={(e) => setSecurityNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={
                          status === "Verified"
                            ? "Add notes (e.g., items verified, time of exit)..."
                            : "Reason for blocking (required)..."
                        }
                        maxLength={1000}
                        required={status === "Blocked"}
                      />
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          Maximum 1000 characters
                        </p>
                        <p className="text-xs text-gray-500">
                          {securityNote.length}/1000
                        </p>
                      </div>
                    </div>

                    {status === "Blocked" && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              <span className="font-semibold">Warning:</span>{" "}
                              Blocking this request will:
                            </p>
                            <ul className="text-xs text-red-600 dark:text-red-400 mt-1 ml-4 list-disc">
                              <li>Prevent the tenant from removing items</li>
                              <li>Notify the tenant and administrators</li>
                              <li>Require administrator review to unblock</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white ${
                  status === "Verified"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : status === "Verified" ? (
                  "Verify & Allow Exit"
                ) : (
                  "Block & Deny Exit"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
