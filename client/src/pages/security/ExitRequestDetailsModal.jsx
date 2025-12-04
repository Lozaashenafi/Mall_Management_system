// components/security/ExitRequestDetailsModal.jsx
import {
  Package,
  User,
  Building,
  Calendar,
  FileText,
  DollarSign,
  Hash,
  Shield,
  Clock,
} from "lucide-react";

export default function ExitRequestDetailsModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  const totalItems = request.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = request.items.reduce(
    (sum, item) => sum + (item.estimatedValue || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Exit Request Details
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    #{request.trackingNumber}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      request.status === "Verified"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : request.status === "Blocked"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Tenant & Property Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Tenant Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Tenant Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium dark:text-white">
                        {request.tenant?.user?.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium dark:text-white">
                        {request.tenant?.companyName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium dark:text-white">
                        {request.tenant?.user?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium dark:text-white">
                        {request.tenant?.user?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Property Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Unit Number</p>
                      <p className="font-medium dark:text-white">
                        {request.rental?.room?.unitNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Building</p>
                      <p className="font-medium dark:text-white">
                        {request.rental?.room?.building?.name || "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium dark:text-white">
                        {request.rental?.room?.building?.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Items to Remove ({request.items.length})
                  </h4>
                  <div className="space-y-3">
                    {request.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white dark:bg-gray-800 rounded border"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium dark:text-white">
                                {item.itemName}
                              </span>
                              <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                Qty: {item.quantity}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {item.estimatedValue && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Estimated Value
                              </p>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                ${item.estimatedValue.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                        {item.serialNumber && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Serial: </span>
                            <span className="font-mono">
                              {item.serialNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t dark:border-gray-600 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="text-xl font-bold dark:text-white">
                        {request.items.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Quantity</p>
                      <p className="text-xl font-bold dark:text-white">
                        {totalItems}
                      </p>
                    </div>
                    {totalValue > 0 && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">
                          Total Estimated Value
                        </p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          ${totalValue.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Request Details */}
              <div className="space-y-6">
                {/* Request Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Request Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Exit Date</span>
                      </div>
                      <p className="font-medium dark:text-white">
                        {new Date(request.exitDate).toLocaleDateString()} at{" "}
                        {new Date(request.exitDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">
                        Request Type
                      </span>
                      <p className="font-medium dark:text-white">
                        {request.type}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Purpose</span>
                      <p className="mt-1 text-sm dark:text-gray-300">
                        {request.purpose}
                      </p>
                    </div>

                    {request.adminNote && (
                      <div>
                        <span className="text-sm text-gray-500">
                          Admin Note
                        </span>
                        <p className="mt-1 text-sm dark:text-gray-300 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          {request.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Verification Info */}
                {(request.verifiedBy || request.securityNote) && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Verification
                    </h4>
                    <div className="space-y-3">
                      {request.verifiedBy && (
                        <div>
                          <span className="text-sm text-gray-500">
                            Verified By
                          </span>
                          <p className="font-medium dark:text-white">
                            {request.securityOfficer?.fullName}
                          </p>
                        </div>
                      )}

                      {request.verifiedAt && (
                        <div>
                          <span className="text-sm text-gray-500">
                            Verified At
                          </span>
                          <p className="font-medium dark:text-white flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(request.verifiedAt).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {request.securityNote && (
                        <div>
                          <span className="text-sm text-gray-500">
                            Security Note
                          </span>
                          <p className="mt-1 text-sm dark:text-gray-300 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            {request.securityNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
