<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">名称</label>
        <el-input v-model="query.name" clearable placeholder="名称" style="width: 150px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">类型</label>
        <el-input v-model="query.type" clearable placeholder="类型" style="width: 150px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">语言</label>
        <el-input v-model="query.language" clearable placeholder="语言" style="width: 150px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">上映地点</label>
        <el-input v-model="query.releaseLocation" clearable placeholder="上映地点" style="width: 150px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <date-range-picker
          v-model="query.releaseDate"
          start-placeholder="releaseDateStart"
          end-placeholder="releaseDateStart"
          class="date-item"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="150px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="英文名称">
            <el-input v-model="form.nameEn" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="海报">
            <el-input v-model="form.img" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="类型(英文逗号分隔)">
            <el-input v-model="form.type" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="语言">
            <el-input v-model="form.language" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="时长">
            <el-input v-model="form.duration" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="上映日期">
            <el-date-picker v-model="form.releaseDate" type="datetime" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="上映地点">
            <el-input v-model="form.releaseLocation" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="综合评分">
            <el-input v-model="form.score" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="评价人数">
            <el-input v-model="form.evaluator" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="剧情简介">
            <el-input v-model="form.details" :rows="3" type="textarea" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="预告片">
            <el-input v-model="form.video" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="导演(英文逗号分隔)">
            <el-input v-model="form.director" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="演员(英文逗号分隔)">
            <el-input v-model="form.actor" style="width: 300px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="nameEn" label="英文名称" />
        <el-table-column prop="img" label="海报" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="language" label="语言" />
        <el-table-column prop="duration" label="时长" />
        <el-table-column prop="releaseDate" label="上映日期" />
        <el-table-column prop="releaseLocation" label="上映地点" />
        <el-table-column prop="score" label="综合评分" />
        <el-table-column prop="director" label="导演" />
        <el-table-column v-if="checkPer(['admin','movieInfo:edit','movieInfo:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudMovieInfo from '@/api/movie/movieInfo'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { movieInfoId: null, name: null, nameEn: null, img: null, type: null, language: null, duration: null, releaseDate: null, releaseLocation: null, score: null, evaluator: null, details: null, video: null, createBy: null, updateBy: null, createTime: null, updateTime: null, director: null, actor: null }
export default {
  name: 'MovieInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '电影详情', url: 'api/movieInfo', idField: 'movieInfoId', sort: 'movieInfoId,desc', crudMethod: { ...crudMovieInfo }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'movieInfo:add'],
        edit: ['admin', 'movieInfo:edit'],
        del: ['admin', 'movieInfo:del']
      },
      rules: {
        movieInfoId: [
          { required: true, message: '电影信息-主键不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: '名称' },
        { key: 'type', display_name: '类型（英文逗号分隔）' },
        { key: 'language', display_name: '语言' },
        { key: 'releaseLocation', display_name: '上映地点' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
