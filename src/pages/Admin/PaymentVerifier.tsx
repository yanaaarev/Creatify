import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, getDoc, Timestamp, where } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { triggerNotification } from '../../utils/triggerNotification';
import AdminSidebar from './AdminSidebar';
import { FaCircleMinus,FaCircleCheck } from "react-icons/fa6";
import ProtectedRoute from "./ProtectedRoute";


interface Payment {
    id: string;
    artistName: string;
    clientUsername: string;
    commissionAmount: number;
    paymentStatus: string;
    createdAt: Timestamp;
    paymentDueDate: Date;
    paymentType: string;
    platformFee: number;
    proofOfDate: Timestamp;
    proofOfPayment: string;
    referenceNumber: string;
    totalAmount: number;
  }
  
  const PaymentVerifier = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [verifiedPayments, setVerifiedPayments] = useState<{ [key: string]: boolean }>({});

useEffect(() => {
  const handleUnload = async () => {
    try {
      await auth.signOut(); // Sign out admin when tab is closed
    } catch (error) {
      console.error("Error during auto logout:", error);
    }
  };

  window.addEventListener("beforeunload", handleUnload);

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
  };
}, []);

    useEffect(() => {
      const fetchPayments = async () => {
        try {
          const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
    
          if (snapshot.empty) {
            setPayments([]);
            return;
          }
    
          // Fetch all artist and client details in a batch
          const artistIds = new Set<string>();
          const clientIds = new Set<string>();
    
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.artistId) artistIds.add(data.artistId);
            if (data.clientId) clientIds.add(data.clientId);
          });
    
          const artistDocs = await getDocs(query(collection(db, "artists"), where("__name__", "in", [...artistIds])));
          const clientDocs = await getDocs(query(collection(db, "users"), where("__name__", "in", [...clientIds])));
    
          const artistMap = artistDocs.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data().fullName || "Unknown Artist";
            return acc;
          }, {} as Record<string, string>);
    
          const clientMap = clientDocs.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data().username || "Unknown Client";
            return acc;
          }, {} as Record<string, string>);
    
          const paymentsData: Payment[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
    
            return {
              id: docSnap.id,
              artistName: artistMap[data.artistId] || "Unknown Artist",
              clientUsername: clientMap[data.clientId] || "Unknown Client",
              commissionAmount: typeof data.commissionAmount === "number" ? data.commissionAmount : 0,
              paymentStatus: typeof data.paymentStatus === "string" ? data.paymentStatus : "pending",
              totalAmount: data.totalAmount || 0,
              createdAt: data.createdAt || Timestamp.now(),
              paymentDueDate: data.paymentDueDate || Timestamp.now(),
              paymentType: data.paymentType || "N/A",
              platformFee: data.platformFee || 0,
              proofOfDate: data.proofOfDate || Timestamp.now(),
              proofOfPayment: data.proofOfPayment || "",
              referenceNumber: data.referenceNumber || "N/A",
            };
          });
    
          setPayments(paymentsData);
    
          // ✅ Initialize verifiedPayments state with already verified payments
          const verifiedState = paymentsData.reduce((acc, payment) => {
            acc[payment.id] = payment.paymentStatus === "verified";
            return acc;
          }, {} as Record<string, boolean>);
    
          setVerifiedPayments(verifiedState);
        } catch (error) {
          console.error("Error fetching payments:", error);
        }
      };
    
      fetchPayments();
    }, []);
    
    const handleVerify = async (paymentId: string) => {
      try {
        const paymentRef = doc(db, "payments", paymentId);
        const paymentSnap = await getDoc(paymentRef);
    
        if (!paymentSnap.exists()) {
          alert("Payment not found.");
          return;
        }
    
        const paymentData = paymentSnap.data();
    
        if (paymentData.paymentStatus === "verified") {
          alert("This payment is already verified.");
          return;
        }
    
        // Fetch artist details
        const artistRef = doc(db, "artists", paymentData.artistId);
        const artistSnap = await getDoc(artistRef);
        const artistDetails = artistSnap.exists() ? artistSnap.data() : null;
    
        // Fetch client details
        const clientRef = doc(db, "users", paymentData.clientId);
        const clientSnap = await getDoc(clientRef);
        const clientDetails = clientSnap.exists() ? clientSnap.data() : null;
    
        if (!artistDetails || !clientDetails) {
          console.error("Artist or Client data missing");
          alert("Error retrieving payment details.");
          return;
        }
    
        // ✅ Update payment status in Firestore
        await updateDoc(paymentRef, { paymentStatus: "verified" });
    
        // ✅ Update local state to reflect changes
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId ? { ...p, paymentStatus: "verified" } : p
          )
        );
    
        // ✅ Update verifiedPayments state
        setVerifiedPayments((prev) => ({
          ...prev,
          [paymentId]: true,
        }));
    
        alert("Payment Verified Successfully!");
    
        // ✅ Trigger notification for "payment-verified"
        await triggerNotification("payment-verified", {
          artistId: paymentData.artistId,
          clientId: paymentData.clientId,
          artistName: artistDetails.fullName || "Unknown Artist",
          clientUsername: clientDetails.username || "Unknown Client",
          bookingId: paymentData.bookingId || "",
          senderId: auth.currentUser?.uid || "",
          timestamp: Timestamp.now(),
        });
      } catch (error) {
        console.error("Error verifying payment:", error);
        alert("Failed to verify payment. Please try again.");
      }
    };

    // 🔹 State for Pagination
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

// 🔹 Calculate the total pages
const totalPages = Math.ceil(payments.length / itemsPerPage);

// 🔹 Get the payments for the current page
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem);


  return (
    <ProtectedRoute>
    <div className="flex">
      {/* 🔹 Sidebar */}
      <AdminSidebar />

      {/* 🔹 Main Content */}
      <div className="flex w-full justify-center items-center min-h-screen bg-white">
        {/* 🔹 Payment Verification Table (Centered & Bordered) */}
        <div className="md:ml-[150px] border border-gray-300 text-[#191919] md:rounded-[30px] md:shadow-lg max-w-[1320px] py-40 px-10 md:py-10 md:px-5 md:h-auto h-full w-full">
          <h2 className="text-2xl font-semibold mb-5 text-center">Payment Verification</h2>

          {/* 🔹 Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="min-w-full border-collapse border border-white text-sm">
              <thead>
                <tr className="bg-[#7db23a] text-white text-center">
                  <th className="border p-2">Payment ID</th>
                  <th className="border p-2">Artist Name</th>
                  <th className="border p-2">Client Username</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Platform Fee</th>
                  <th className="border p-2">Total Amount</th>
                  <th className="border p-2">Payment Type</th>
                  <th className="border p-2">Due Date</th>
                  <th className="border p-2">Reference No.</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Proof</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b text-center">
                    <td className="border p-2">{payment.id}</td>
                    <td className="border p-2">{payment.artistName}</td>
                    <td className="border p-2">{payment.clientUsername}</td>
                    <td className="border p-2">₱{payment.commissionAmount.toFixed(2)}</td>
                    <td className="border p-2">₱{payment.platformFee}</td>
                    <td className="border p-2">₱{payment.totalAmount.toFixed(2)}</td>
                    <td className="border p-2">{payment.paymentType}</td>
                    <td className="border p-2">
                      {payment.paymentDueDate ? 
                        new Date(payment.paymentDueDate).toLocaleDateString() 
                        : "N/A"}
                    </td>

                    <td className="border p-2">{payment.referenceNumber}</td>
                    <td className="border p-2">{payment.paymentStatus}</td>
                    <td className="border p-2">
                      {payment.proofOfPayment ? (
                        <button className="text-[#7db23a] hover:underline" onClick={() => setSelectedProof(payment.proofOfPayment)}>
                          View
                        </button>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      <button onClick={() => handleVerify(payment.id)} className="text-2xl">
                        {verifiedPayments[payment.id] ? (
                          <FaCircleCheck className="text-[#7db23a]" />
                        ) : (
                          <FaCircleMinus className="text-gray-500 hover:text-gray-700" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="border p-4 text-center text-gray-500">
                    No payments available yet.
                  </td>
                </tr>
              )}
            </tbody>

            </table>
          </div>

          
    {/* 🔹 Pagination Controls (Only Show When More than 10 Payments) */}
    {totalPages > 1 && (
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-4 py-2 mx-1 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#7db23a] text-white"}`}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="px-4 py-2 bg-gray-200 rounded">{currentPage}/{totalPages}</span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className={`px-4 py-2 mx-1 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#7db23a] text-white"}`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    )}

          {/* 🔹 Proof of Payment Overlay */}
          {selectedProof && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 py-10">
    <div className="relative w-full h-full max-w-[360px]">
      
      {/* Close Button (Positioned at Top Right Outside the White Background) */}
      <button 
        className="absolute -top-4 -right-10 text-white"
        onClick={() => setSelectedProof(null)}
      >
        ✖
      </button>

      {/* Proof of Payment Image */}
      <img 
        src={selectedProof} 
        alt="Proof of Payment" 
        className="max-w-full h-full"
        onError={(e) => e.currentTarget.src = "/placeholder-proof.webp"} 
      />
    </div>
  </div>
)}

        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default PaymentVerifier;