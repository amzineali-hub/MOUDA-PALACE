const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const importTarget = `import { ChefHat, ShoppingCart, Info, Phone, Search, Trash2, Edit3, MapPin, ExternalLink, Calendar, CheckCircle2, ChevronRight, Upload, X, Camera, Play, Check, AlertCircle, Save, Smartphone, Menu, Star, Globe, Settings, Users, ArrowRight, Zap, Coffee, FileText, Bell, MessageSquare, Truck, Heart, TrendingUp, ChevronDown, Package, LayoutDashboard, UtensilsCrossed, Monitor, Briefcase, Calculator, ConciergeBell, History, CalendarCheck } from 'lucide-react';`;
const importReplacement = `import { ChefHat, ShoppingCart, Info, Phone, Search, Trash2, Edit3, MapPin, ExternalLink, Calendar, CheckCircle2, ChevronRight, Upload, X, Camera, Play, Check, AlertCircle, Save, Smartphone, Menu, Star, Globe, Settings, Users, ArrowRight, Zap, Coffee, FileText, Bell, MessageSquare, Truck, Heart, TrendingUp, ChevronDown, Package, LayoutDashboard, UtensilsCrossed, Monitor, Briefcase, Calculator, ConciergeBell, History, CalendarCheck, Activity } from 'lucide-react';`;
content = content.replace(importTarget, importReplacement);
fs.writeFileSync('src/App.tsx', content);
