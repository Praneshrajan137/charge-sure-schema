import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlugShareHeaderProps {
	onSearch: (query: string) => void;
}

const PlugShareHeader: React.FC<PlugShareHeaderProps> = ({ onSearch }) => {
	const [query, setQuery] = useState("");

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			onSearch(query.trim());
		}
	};

	return (
		<header className="bg-[#1e4d8b] text-white shadow-lg relative z-50">
			<div className="flex items-center px-4 py-3 gap-4">
				{/* Logo */}
				<div className="flex items-center mr-2">
					<div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
						<div className="w-5 h-5 bg-[#1e4d8b] rounded-full flex items-center justify-center">
							<div className="w-2 h-2 bg-white rounded-full"></div>
						</div>
					</div>
					<span className="text-xl font-bold">PlugShare</span>
				</div>

				{/* Search Bar */}
				<div className="flex-1 max-w-md mx-4">
					<div className="relative">
						<Input
							type="text"
							placeholder="Search for a Charging Location"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={handleKeyDown}
							className="w-full pl-4 pr-10 py-2 border-0 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/20"
						/>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => onSearch(query.trim())}
							className="absolute right-0 top-0 h-full px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
						>
							<Search className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
};

export default PlugShareHeader;
