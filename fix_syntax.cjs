const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The first replacement was correct.
// We just need to fix the first occurrence of the closing div that was broken.
const brokenFirstOccurrence = `              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}`;
const fixedFirstOccurrence = `              </tbody>
            </table>
          </div>
        </div>
      )}`;

content = content.replace(brokenFirstOccurrence, fixedFirstOccurrence);

// Then we need to fix the payroll closing div, which is currently:
const payrollClosingDivs = `              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (`

const fixedPayrollClosingDivs = `              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'roles' && (`

content = content.replace(payrollClosingDivs, fixedPayrollClosingDivs);

fs.writeFileSync('src/App.tsx', content);
console.log("Syntax fixed");
