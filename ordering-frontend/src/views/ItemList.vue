<template>
    <ItemListComponent
    :isAdmin="false"
    pageTitle="상품목록"
    />
</template>

<script>
import ItemListComponent from '@/components/ItemListComponent.vue';

export default {
    // props:['isAdmin'],
    components: {ItemListComponent}
}
</script>