import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, X, CalendarIcon, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchAndFiltersProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterOptions) => void;
  showAdvanced?: boolean;
}

interface FilterOptions {
  searchQuery: string;
  petType: string;
  category: string;
  location: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: string;
}

const petTypes = [
  { value: "all", label: "All Pets" },
  { value: "dog", label: "Dogs" },
  { value: "cat", label: "Cats" },
  { value: "bird", label: "Birds" },
  { value: "fish", label: "Fish" },
  { value: "rabbit", label: "Rabbits" },
  { value: "other", label: "Other" },
];

const categories = [
  { value: "all", label: "All Posts" },
  { value: "question", label: "Questions" },
  { value: "advice", label: "Advice" },
  { value: "photos", label: "Photos" },
  { value: "health", label: "Health" },
  { value: "training", label: "Training" },
  { value: "funny", label: "Funny Moments" },
  { value: "milestone", label: "Milestones" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "trending", label: "Trending" },
];

export function SearchAndFilters({ onSearch, onFilter, showAdvanced = false }: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    petType: "all",
    category: "all",
    location: "",
    dateRange: { from: null, to: null },
    sortBy: "newest",
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const updatedFilters = { ...filters, searchQuery: query };
    setFilters(updatedFilters);
    onSearch?.(query);
    onFilter?.(updatedFilters);
  };

  const handleFilterChange = (key: string, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilter?.(updatedFilters);
  };

  const clearFilters = () => {
    const resetFilters: FilterOptions = {
      searchQuery: "",
      petType: "all",
      category: "all",
      location: "",
      dateRange: { from: null, to: null },
      sortBy: "newest",
    };
    setFilters(resetFilters);
    setSearchQuery("");
    onFilter?.(resetFilters);
    onSearch?.("");
  };

  const hasActiveFilters = 
    filters.petType !== "all" || 
    filters.category !== "all" || 
    filters.location !== "" || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null ||
    filters.sortBy !== "newest";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts, topics, or users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-12"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className={cn("h-4 w-4", showFilters && "text-primary")} />
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.petType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {petTypes.find(p => p.value === filters.petType)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange("petType", "all")}
              />
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {categories.find(c => c.value === filters.category)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange("category", "all")}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              📍 {filters.location}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange("location", "")}
              />
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="gap-1">
              📅 Date range
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange("dateRange", { from: null, to: null })}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="font-medium">Filters & Sorting</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Pet Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pet Type</label>
              <Select value={filters.petType} onValueChange={(value) => handleFilterChange("petType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {petTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            {showAdvanced && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter city or area..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                />
              </div>
            )}

            {/* Date Range Filter */}
            {showAdvanced && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !filters.dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? (
                          format(filters.dateRange.from, "PPP")
                        ) : (
                          <span>From date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) => handleFilterChange("dateRange", { ...filters.dateRange, from: date })}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !filters.dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? (
                          format(filters.dateRange.to, "PPP")
                        ) : (
                          <span>To date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) => handleFilterChange("dateRange", { ...filters.dateRange, to: date })}
                        disabled={(date) => date > new Date() || (filters.dateRange.from && date < filters.dateRange.from)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}