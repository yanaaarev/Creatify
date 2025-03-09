import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, getDoc, Timestamp } from 'firebase/firestore';
import { auth,db } from '../../config/firebaseConfig';
import { triggerNotification } from '../../utils/triggerNotification';

interface Payment {
    id: string;
    artistName: string;
    clientUsername: string;
    commissionAmount: number;
    paymentStatus: string;
    createdAt: Timestamp;
    dueDate: Timestamp;
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
  
    useEffect(() => {
      const fetchPayments = async () => {
        try {
          const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
  
          const paymentsData: Payment[] = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
  
              // Ensure all fields are properly structured
              const commissionAmount = typeof data.commissionAmount === "number" ? data.commissionAmount : 0;
              const paymentStatus = typeof data.paymentStatus === "string" ? data.paymentStatus : "pending";
  
              // Fetch artist name
              let artistName = "Unknown Artist";
              if (data.artistId) {
                const artistRef = doc(db, "artists", data.artistId);
                const artistSnap = await getDoc(artistRef);
                if (artistSnap.exists()) {
                  artistName = artistSnap.data().fullName || "Unknown Artist";
                }
              }
  
              // Fetch client username
              let clientUsername = "Unknown Client";
              if (data.clientId) {
                const clientRef = doc(db, "users", data.clientId);
                const clientSnap = await getDoc(clientRef);
                if (clientSnap.exists()) {
                  clientUsername = clientSnap.data().username || "Unknown Client";
                }
              }
  
              return {
                id: docSnap.id,
                artistName,
                clientUsername,
                commissionAmount,
                paymentStatus,
                totalAmount: data.totalAmount || 0,
                createdAt: data.createdAt || Timestamp.now(),
                dueDate: data.dueDate || Timestamp.now(),
                paymentType: data.paymentType || "N/A",
                platformFee: data.platformFee || 0,
                proofOfDate: data.proofOfDate || Timestamp.now(),
                proofOfPayment: data.proofOfPayment || "",
                referenceNumber: data.referenceNumber || "N/A",
              };
            })
          );
  
          setPayments(paymentsData);
        } catch (error) {
          console.error("Error fetching payments:", error);
        }
      };
  
      fetchPayments();
    }, []);
  
  
    const verifyPayment = async (paymentId: string) => {
      try {
          const paymentRef = doc(db, 'payments', paymentId);
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
          const artistRef = doc(db, 'artists', paymentData.artistId);
          const artistSnap = await getDoc(artistRef);
          const artistDetails = artistSnap.exists() ? artistSnap.data() : null;
  
          // Fetch client details
          const clientRef = doc(db, 'users', paymentData.clientId);
          const clientSnap = await getDoc(clientRef);
          const clientDetails = clientSnap.exists() ? clientSnap.data() : null;
  
          if (!artistDetails || !clientDetails) {
              console.error("Artist or Client data missing");
              alert("Error retrieving payment details.");
              return;
          }
  
          // ✅ Update payment status in Firestore
          await updateDoc(paymentRef, { paymentStatus: 'verified' });
  
          // ✅ Update local state to reflect changes
          setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, paymentStatus: 'verified' } : p));
  
          alert('Payment Verified Successfully!');
  
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
          console.error('Error verifying payment:', error);
          alert('Failed to verify payment. Please try again.');
      }
  };
  
  return (
    <div className="p-5 overflow-x-auto w-full">
  <table className="min-w-full border-collapse border border-gray-200 text-xs">
    <thead>
      <tr className="bg-gray-100">
        <th className="border p-1">Payment ID</th>
        <th className="border p-1">Artist</th>
        <th className="border p-1">Client</th>
        <th className="border p-1">Amount</th>
        <th className="border p-1">Total Amount</th>
        <th className="border p-1">Payment Type</th>
        <th className="border p-1">Platform Fee</th>
        <th className="border p-1">Due Date</th>
        <th className="border p-1">Proof Date</th>
        <th className="border p-1">Reference #</th>
        <th className="border p-1">Status</th>
        <th className="border p-1">Proof</th>
        <th className="border p-1">Action</th>
      </tr>
    </thead>
    <tbody>
      {payments.map((payment) => (
        <tr key={payment.id}>
          <td className="border p-1">{payment.id}</td>
          <td className="border p-1">{payment.artistName}</td>
          <td className="border p-1">{payment.clientUsername}</td>
          <td className="border p-1">₱{payment.commissionAmount.toFixed(2)}</td>
          <td className="border p-1">₱{payment.totalAmount.toFixed(2)}</td>
          <td className="border p-1">{payment.paymentType}</td>
          <td className="border p-1">{payment.platformFee === 6.5 ? "6.5%" : "3%"}</td>
          <td className="border p-1">
            {payment.dueDate ? new Date(payment.dueDate.toDate()).toLocaleDateString() : "N/A"}
          </td>
          <td className="border p-1">
            {payment.proofOfDate ? new Date(payment.proofOfDate.toDate()).toLocaleDateString() : "N/A"}
          </td>
          <td className="border p-1">{payment.referenceNumber}</td>
          <td className="border p-1">{payment.paymentStatus}</td>
          <td className="border p-1">
            {payment.proofOfPayment ? (
              <button
                className="text-blue-500 underline"
                onClick={() => setSelectedProof(payment.proofOfPayment)}
              >
                View Attachment
              </button>
            ) : (
              "No Proof"
            )}
          </td>
          <td className="border p-1">
            {payment.paymentStatus !== 'verified' && (
              <button
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                onClick={() => verifyPayment(payment.id)}
              >
                Verify
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  {selectedProof && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-[90%] max-h-[90%] overflow-auto">
            <img src={selectedProof} alt="Proof of Payment" className="max-w-full h-auto mx-auto rounded" onError={(e) => e.currentTarget.src = "/placeholder-proof.png"} />
            <button 
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded w-full"
                onClick={() => setSelectedProof(null)}
            >
                Close
            </button>
        </div>
    </div>
)}
        </div>
  );
};

export default PaymentVerifier;