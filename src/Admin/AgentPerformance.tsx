import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./table";
import Badge from "./badge/Badge";
import { useEffect, useState } from 'react';

interface Agent {
  agent_name: string;
  avg_score: number;
  avg_professionalism: number;
  avg_product_knowledge: number;
  avg_communication_skills: number;
  avg_problem_solving: number;
}

interface AgentRanking {
  top_5_agents: Agent[];
  bottom_5_agents: Agent[];
}

export default function AgentPerformance() {
  const [agentData, setAgentData] = useState<AgentRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const response = await fetch('http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/agent/score-ranking');
        if (!response.ok) {
          throw new Error('Failed to fetch agent data');
        }
        const data: AgentRanking = await response.json();
        setAgentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">Error loading agent data</p>
        <p className="text-red-500 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-600">No agent data available</p>
      </div>
    );
  }

  // Function to get badge color based on score
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'success';
    if (score >= 5) return 'warning';
    return 'error';
  };

  // Function to capitalize first letter of agent name
  const formatAgentName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Performers Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Top Performing Agents</h3>
              <p className="text-sm text-gray-600 mt-1">Agents with highest average scores</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professionalism
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Knowledge
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Communication
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem Solving
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white divide-y divide-gray-200">
              {agentData.top_5_agents.map((agent, index) => (
                <TableRow key={`top-${index}`} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-800 font-medium">
                          {formatAgentName(agent.agent_name).charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAgentName(agent.agent_name)}
                        </div>
                        <div className="text-sm text-gray-500">Top performer</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex">
                      <Badge
                        size="md"
                        color={getScoreColor(agent.avg_score)}
                      >
                        {agent.avg_score.toFixed(1)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${(agent.avg_professionalism / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{agent.avg_professionalism.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-purple-500 rounded-full" 
                          style={{ width: `${(agent.avg_product_knowledge / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{agent.avg_product_knowledge.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-teal-500 rounded-full" 
                          style={{ width: `${(agent.avg_communication_skills / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{agent.avg_communication_skills.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-amber-500 rounded-full" 
                          style={{ width: `${(agent.avg_problem_solving / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{agent.avg_problem_solving.toFixed(1)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bottom Performers Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Agents Needing Improvement</h3>
              <p className="text-sm text-gray-600 mt-1">Agents with lowest average scores</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professionalism
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Knowledge
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Communication
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem Solving
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white divide-y divide-gray-200">
              {agentData.bottom_5_agents.map((agent, index) => (
                <TableRow key={`bottom-${index}`} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-800 font-medium">
                          {formatAgentName(agent.agent_name).charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAgentName(agent.agent_name)}
                        </div>
                        <div className="text-sm text-gray-500">Needs improvement</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex">
                      <Badge
                        size="md"
                        color={getScoreColor(agent.avg_score)}
                      >
                        {agent.avg_score.toFixed(1)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${(agent.avg_professionalism / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{agent.avg_professionalism.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-purple-500 rounded-full" 
                          style={{ width: `${(agent.avg_product_knowledge / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{agent.avg_product_knowledge.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-teal-500 rounded-full" 
                          style={{ width: `${(agent.avg_communication_skills / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{agent.avg_communication_skills.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-amber-500 rounded-full" 
                          style={{ width: `${(agent.avg_problem_solving / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{agent.avg_problem_solving.toFixed(1)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}