export default function Pot({ amount, currentBets }) {
  const totalPot = amount + (currentBets || 0);

  return (
    <div className="bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg border-2 border-yellow-700">
      <div className="text-center">
        <div className="text-xs font-semibold">Pot</div>
        <div className="text-xl font-bold">{totalPot}</div>
      </div>
    </div>
  );
}
