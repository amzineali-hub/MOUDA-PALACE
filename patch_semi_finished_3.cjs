const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add new state
const targetState = `  const [semiFinished, setSemiFinished] = useState<any[]>([]);
  const [isSemiFinishedModalOpen, setIsSemiFinishedModalOpen] = useState(false);
  const [semiFinishedForm, setSemiFinishedForm] = useState<any>({ name: '', unit: 'kg', cost: '', quantity: 0 });`;

const replacementState = `  const [semiFinished, setSemiFinished] = useState<any[]>([]);
  const [isSemiFinishedModalOpen, setIsSemiFinishedModalOpen] = useState(false);
  const [semiFinishedForm, setSemiFinishedForm] = useState<any>({ name: '', unit: 'kg', cost: '', quantity: 0 });
  const [isSemiFinishedAdjustModalOpen, setIsSemiFinishedAdjustModalOpen] = useState(false);
  const [semiFinishedAdjustData, setSemiFinishedAdjustData] = useState<any>({id: '', name: '', quantity: 0, adjustment: ''});
  const [isSemiFinishedDeleteModalOpen, setIsSemiFinishedDeleteModalOpen] = useState(false);
  const [semiFinishedDeleteData, setSemiFinishedDeleteData] = useState<any>({id: '', name: ''});`;

if(code.includes(targetState)) {
  code = code.replace(targetState, replacementState);
} else {
  console.log('State target not found');
}

// 2. Fix the edit modal to always show stock input
const targetModalForm = `              {!semiFinishedForm.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{semiFinishedForm.id ? 'Quantité en stock' : 'Stock initial'}</label>
                  <input
                    type="number"
                    value={semiFinishedForm.quantity}
                    onChange={(e) => setSemiFinishedForm({...semiFinishedForm, quantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  />
                </div>
              )}`;
// Note: wait, in my previous fix I actually removed the `{!semiFinishedForm.id && (` ... let me check what is in the file.
