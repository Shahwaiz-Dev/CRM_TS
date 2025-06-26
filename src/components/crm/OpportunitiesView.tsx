import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const sampleOpportunities = [
  { name: 'Aibox', account: 'Aibox', amount: 13400, closeDate: '6/6/2024', stage: 'Closed Won', owner: 'MSmith' },
  { name: 'Buzzbean – New Business', account: 'Buzzbean', amount: 15000, closeDate: '5/17/2024', stage: 'Negotiate', owner: 'MSmith' },
  { name: 'Buzzbean – Add-on', account: 'Buzzbean', amount: 4500, closeDate: '6/10/2024', stage: 'Negotiate', owner: 'MSmith' },
  { name: 'Camido', account: 'Camido', amount: 18950, closeDate: '6/22/2024', stage: 'Meet & Present', owner: 'MSmith' },
  { name: 'Dabshots', account: 'Dabshots', amount: 22000, closeDate: '7/9/2024', stage: 'Qualify', owner: 'MSmith' },
  { name: 'Divanoodle', account: 'Divanoodle', amount: 13400, closeDate: '6/28/2024', stage: 'Qualify', owner: 'MSmith' },
  { name: 'Edgewire', account: 'Edgewire', amount: 27300, closeDate: '6/19/2024', stage: 'Propose', owner: 'MSmith' },
  { name: 'Eire', account: 'Eire', amount: 23500, closeDate: '5/28/2024', stage: 'Negotiate', owner: 'MSmith' },
  { name: 'Fatz', account: 'Fatz', amount: 2500, closeDate: '5/15/2024', stage: 'Closed Won', owner: 'MSmith' },
  { name: 'Feedspan – New Business', account: 'Feedspan', amount: 31000, closeDate: '6/7/2024', stage: 'Negotiate', owner: 'MSmith' },
];

export function OpportunitiesView() {
  const [search, setSearch] = useState('');
  const filtered = sampleOpportunities.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.account.toLowerCase().includes(search.toLowerCase()) ||
    o.owner.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">All Opportunities</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search this list..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
          <Button>New</Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">#</th>
              <th className="px-4 py-2 text-left font-semibold">Opportunity Name</th>
              <th className="px-4 py-2 text-left font-semibold">Account Name</th>
              <th className="px-4 py-2 text-left font-semibold">Amount</th>
              <th className="px-4 py-2 text-left font-semibold">Close Date</th>
              <th className="px-4 py-2 text-left font-semibold">Stage</th>
              <th className="px-4 py-2 text-left font-semibold">Opportunity Owner Alias</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={o.name} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2 text-blue-700 font-medium cursor-pointer hover:underline">{o.name}</td>
                <td className="px-4 py-2">{o.account}</td>
                <td className="px-4 py-2">${o.amount.toLocaleString()}</td>
                <td className="px-4 py-2">{o.closeDate}</td>
                <td className="px-4 py-2">{o.stage}</td>
                <td className="px-4 py-2 text-blue-700 font-medium cursor-pointer hover:underline">{o.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 