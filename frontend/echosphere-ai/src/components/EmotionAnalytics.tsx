import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { Activity } from "lucide-react";

interface EmotionDataPoint {
  time: string;
  happy: number;
  sad: number;
  angry: number;
  neutral: number;
}

interface EmotionAnalyticsProps {
  data: EmotionDataPoint[];
}

export const EmotionAnalytics = ({ data }: EmotionAnalyticsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Emotion Analytics</h3>
          <p className="text-sm text-muted-foreground">Real-time emotion tracking</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="happyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(45, 95%, 55%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(45, 95%, 55%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="sadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="angryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="hsl(220, 10%, 40%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(220, 10%, 40%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 15%, 12%)",
                border: "1px solid hsl(220, 15%, 25%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
            />
            <Area
              type="monotone"
              dataKey="happy"
              stroke="hsl(45, 95%, 55%)"
              fill="url(#happyGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="sad"
              stroke="hsl(210, 80%, 55%)"
              fill="url(#sadGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="angry"
              stroke="hsl(0, 85%, 55%)"
              fill="url(#angryGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emotion-happy" />
          <span className="text-xs text-muted-foreground">Happy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emotion-sad" />
          <span className="text-xs text-muted-foreground">Sad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emotion-angry" />
          <span className="text-xs text-muted-foreground">Angry</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EmotionAnalytics;
