import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  TrendingUp,
  Users,
  Share2,
  Eye,
  Download,
  Facebook,
  Instagram,
  Music,
  MessageCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AnalyticsPage = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState('weekly');
  const [platform, setPlatform] = useState('all');

  const generateData = (numPoints, factor) => {
    return Array.from({ length: numPoints }, (_, i) => ({
      name: `Day ${i + 1}`,
      shares: Math.floor(Math.random() * 20 * factor),
      follows: Math.floor(Math.random() * 15 * factor),
      views: Math.floor(Math.random() * 100 * factor),
    }));
  };

  const platformData = [
    { name: 'Facebook', value: 45, color: '#1877F2' },
    { name: 'Instagram', value: 35, color: '#E4405F' },
    { name: 'TikTok', value: 15, color: '#000000' },
    { name: 'Xiaohongshu', value: 5, color: '#FF2442' }
  ];

  const topTemplates = [
    { name: 'Summer Sale Promotion', shares: 156, follows: 89, engagement: '12.4%' },
    { name: 'New Arrivals Showcase', shares: 134, follows: 67, engagement: '10.8%' },
    { name: 'Weekend Special Offer', shares: 98, follows: 45, engagement: '8.9%' },
  ];

  const handleExportData = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <>
      <Head>
        <title>Analytics - ShareAI Platform</title>
        <meta name="description" content="Track your social media performance and engagement analytics." />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your social media performance and engagement</p>
          </div>
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Tabs defaultValue="weekly" onValueChange={setTimeframe} className="w-auto">
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="xiaohongshu">Xiaohongshu</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Views', value: '2,847', change: '+12%', icon: Eye, color: 'from-blue-500 to-blue-600' },
            { title: 'Social Shares', value: '456', change: '+18%', icon: Share2, color: 'from-green-500 to-green-600' },
            { title: 'New Follows', value: '234', change: '+25%', icon: Users, color: 'from-purple-500 to-purple-600' },
            { title: 'Engagement Rate', value: '11.2%', change: '+8%', icon: TrendingUp, color: 'from-orange-500 to-orange-600' }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                      <p className="text-sm text-green-600 mt-1">{metric.change} from last period</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${metric.color}`}>
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Daily shares, follows, and views for {platform} over time ({timeframe})</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateData(30, Math.random() + 0.5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="shares" stroke="#10b981" strokeWidth={2} name="Shares" />
                    <Line type="monotone" dataKey="follows" stroke="#3b82f6" strokeWidth={2} name="Follows" />
                    <Line type="monotone" dataKey="views" stroke="#f59e0b" strokeWidth={2} name="Views" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Engagement breakdown by social media platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Templates</CardTitle>
              <CardDescription>Your most successful templates ranked by engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTemplates.map((template, index) => (
                  <div key={template.name} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">Engagement Rate: {template.engagement}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Share2 className="h-4 w-4" />
                        <span>{template.shares}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{template.follows}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AnalyticsPage;