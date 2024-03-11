<template>
    <ItemListComponent
        :isAdmin="true"
        pageTitle="상품관리"
    />
</template>

<script>
import ItemListComponent from '@/components/ItemListComponent.vue';

export default {
    // props:['isAdmin'],
    components: {ItemListComponent}
}
</script>