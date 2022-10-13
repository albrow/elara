<!-- <script lang="ts">
</script> -->

<template>
    <div id="nav">
        <router-link to="/">
            <span class="text-lg font-bold text-blue-500 mx-4">Home</span>
        </router-link>
        <router-link to="/level/1">
            <span class="text-lg font-bold text-blue-500 mx-4">Level 1</span>
        </router-link>
        <router-link to="/level/2">
            <span class="text-lg font-bold text-blue-500 mx-4">Level 2</span>
        </router-link>
    </div>
    <router-view></router-view>
</template>
