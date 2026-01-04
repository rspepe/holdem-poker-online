export default function Pot({ amount, currentBets }) {
  const totalPot = amount + (currentBets || 0);

  return (
    <div className="bg-yellow-600 text-white px-6 py-3 rounded-full shadow-lg border-4 border-yellow-700">
      <div className="text-center">
        <div className="text-sm font-semibold">Pot</div>
        <div className="text-2xl font-bold">{totalPot}</div>
      </div>
    </div>
  );
}
