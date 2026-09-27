<script setup>
const menus = [
  { name: "Home", path: "/" },
  { name: "Features", path: "/" },
  { name: "About", path: "/" },
  { name: "Contact", path: "/" },
];
const user = {
  name: "isaia",
  email: "isaia@test.com",
};
</script>

<template>
    <header className="max-w-4xl mx-auto rounded-full h-[80px] border-b border-amber-400/30 bg-slate-800/40 backdrop-blur-md px-8 flex items-center justify-between mb-6">
      
      <nav>
        <ul className="flex items-center gap-8">
          
            <li v-for="menu in menus" :key="menu.name">
              <router-link
                :to="menu.path"
                className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors"
              >
                {{ menu.name }}
              </router-link>
            </li>
        </ul>
          
      </nav>

      
      <div>
        
        <div v-if="user" class="">
            
          <router-link to="/profile" className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/60 px-5 py-1.5 transition-all hover:border-amber-400/50 hover:bg-slate-900 cursor-pointer group">
            
            
            <div className="text-right">
              <p className="text-sm font-medium text-slate-200 group-hover:text-amber-400 transition-colors">
                {{ user?.name || "Utilisateur" }}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-[140px]">
                {{ user?.email || "Email" }}
              </p>
            </div>

            
            <div className="w-9 h-9 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400 text-sm font-semibold flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
              {{ user?.name ? user.name[0].toUpperCase() : "U" }}
            </div>
          </router-link>
        </div>
        
          <router-link v-else
            to="/auth/login"
            className="bg-slate-800 border-2 border-amber-400 text-amber-400 text-sm font-medium rounded-full px-8 py-2.5 hover:bg-amber-400 hover:text-slate-950 transition-all inline-block"
          >
            Sign In
          </router-link>
        
      </div>
    </header>
</template>
